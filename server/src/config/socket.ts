import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../services/jwtService.js';
import {
  findOrCreateChat,
  verifyChatAccess,
  createMessage,
  formatMessagePayload,
  markChatMessagesAsRead,
  toggleMessageLike,
} from '../services/chatService.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Store active users (userId -> socketId[])
const activeUsers = new Map<string, Set<string>>();

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error: any) {
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    logger.info(`User connected`, { userId, socketId: socket.id });

    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId)!.add(socket.id);

    // Notify others that this user is online
    socket.broadcast.emit('user-online', { userId });

    // Join user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // Handle joining a chat room
    socket.on('join-chat', async (chatId: string) => {
      try {
        const { error } = await verifyChatAccess(chatId, userId);
        if (error) {
          socket.emit('error', { message: error.message });
          return;
        }
        socket.join(`chat:${chatId}`);
        logger.debug(`User joined chat`, { userId, chatId });
      } catch (error) {
        logger.error('Error joining chat', { error, userId, chatId });
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving a chat room
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.debug(`User left chat`, { userId, chatId });
    });

    // Handle sending a message
    socket.on('send-message', async (data: {
      chatId: string;
      content?: string;
      imageUrl?: string;
      voiceMessageUrl?: string;
      voiceMessageDuration?: number;
    }) => {
      try {
        let { chatId, content, imageUrl, voiceMessageUrl, voiceMessageDuration } = data;

        if (!content && !imageUrl && !voiceMessageUrl) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify chat exists and user is a participant, or create it
        let chat;
        let actualChatId = chatId;
        let isGroup = false;
        
        const { chat: existingChat, isGroup: isGroupChat, error: accessError } = await verifyChatAccess(chatId, userId);
        
        if (accessError) {
          // Chat doesn't exist, try to create it (chatId might be a userId)
          // Only create regular chats, not groups
          const { chat: newChat, error: createError } = await findOrCreateChat(userId, chatId);
          
          if (createError) {
            socket.emit('error', { message: createError.message });
            return;
          }
          
          chat = newChat;
          actualChatId = chat._id.toString();
          isGroup = false;
          
          // Join the correct chat room
          if (actualChatId !== chatId) {
            socket.join(`chat:${actualChatId}`);
          }
        } else {
          chat = existingChat;
          isGroup = isGroupChat || false;
        }

        // Create and save message
        const savedMessage = await createMessage(chat, {
          senderId: userId,
          content,
          imageUrl,
          voiceMessageUrl,
          voiceMessageDuration,
        }, isGroup);

        if (!savedMessage || !savedMessage._id) {
          socket.emit('error', { message: 'Failed to retrieve saved message' });
          return;
        }

        // Format and emit message
        const messagePayload = formatMessagePayload(savedMessage, actualChatId);
        
        // Emit to all users in the chat room
        io.to(`chat:${actualChatId}`).emit('new-message', { message: messagePayload });
        
        if (isGroup) {
          // For group chats, broadcast to all group members
          const memberIds = chat.members.map((m: any) => m.toString());
          
          // Emit to all group members' personal rooms
          memberIds.forEach((memberId: string) => {
            io.to(`user:${memberId}`).emit('new-message', { message: messagePayload });
          });
          
          // Emit chat update to all group members
          const chatUpdate = {
            chatId: actualChatId,
            lastMessage: savedMessage.content || 'Media',
            timestamp: messagePayload.timestamp,
          };
          
          memberIds.forEach((memberId: string) => {
            io.to(`user:${memberId}`).emit('chat-updated', chatUpdate);
          });
        } else {
          // For one-on-one chats, get the other participant
          const otherParticipantId = chat.participants.find((p: any) => p.toString() !== userId)?.toString();
          
          // Emit to sender's personal room
          io.to(`user:${userId}`).emit('new-message', { message: messagePayload });
          
          if (otherParticipantId) {
            io.to(`user:${otherParticipantId}`).emit('new-message', { message: messagePayload });
          }

          // Emit chat update to both participants
          const chatUpdate = {
            chatId: actualChatId,
            lastMessage: savedMessage.content || 'Media',
            timestamp: messagePayload.timestamp,
          };
          
          if (otherParticipantId) {
            io.to(`user:${otherParticipantId}`).emit('chat-updated', chatUpdate);
          }
          io.to(`user:${userId}`).emit('chat-updated', chatUpdate);
        }

        // Confirm message sent
        socket.emit('message-sent', { messageId: savedMessage._id.toString() });
      } catch (error: any) {
        logger.error('Error sending message', { error, userId, chatId: data.chatId });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('user-typing', {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
    });

    // Handle marking messages as read
    socket.on('mark-read', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;

        const { chat, error } = await verifyChatAccess(chatId, userId);
        if (error) {
          return;
        }

        await markChatMessagesAsRead(chat, userId);

        // Notify other participants
        socket.to(`chat:${chatId}`).emit('messages-read', {
          userId,
          chatId,
        });
      } catch (error) {
        logger.error('Error marking messages as read', { error, userId, chatId: data.chatId });
      }
    });

    // Handle toggling message like
    socket.on('toggle-message-like', async (data: { chatId: string; messageId: string }) => {
      try {
        const { chatId, messageId } = data;

        const { chat, error } = await verifyChatAccess(chatId, userId);
        if (error) {
          return;
        }

        const result = await toggleMessageLike(chat, messageId, userId);
        if (result.error) {
          return;
        }

        // Notify all participants in the chat
        io.to(`chat:${chatId}`).emit('message-like-toggled', {
          chatId,
          messageId,
          userId,
          isLiked: result.isLiked,
          likesCount: result.likesCount,
        });
      } catch (error) {
        logger.error('Error toggling message like', { error, userId, chatId: data.chatId, messageId: data.messageId });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`User disconnected`, { userId, socketId: socket.id });

      // Remove socket from active users
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUsers.delete(userId);
          
          // Update lastSeen timestamp when user goes offline
          try {
            await User.findByIdAndUpdate(userId, {
              lastSeen: new Date(),
            });
          } catch (error) {
            logger.error('Error updating lastSeen', { error, userId });
          }
          
          // Notify others that this user is offline
          socket.broadcast.emit('user-offline', { userId });
        }
      }
    });
  });

  return io;
};

// Helper function to check if a user is online
export const isUserOnline = (userId: string): boolean => {
  return activeUsers.has(userId) && activeUsers.get(userId)!.size > 0;
};

// Helper function to get online users
export const getOnlineUsers = (): string[] => {
  return Array.from(activeUsers.keys());
};

