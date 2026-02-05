import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../services/jwtService.js';
import { findOrCreateChat, verifyChatAccess, createMessage, formatMessagePayload, markChatMessagesAsRead, toggleMessageLike, } from '../services/chatService.js';
import { logger } from '../utils/logger.js';
import { env } from './env.js';
// Store active users (userId -> socketId[])
const activeUsers = new Map();
/**
 * Get CORS origin configuration for Socket.IO
 * Matches the Express CORS configuration
 */
const getSocketCorsOrigin = () => {
    // In development, allow all origins for easier local development
    if (env.NODE_ENV === 'development') {
        return true;
    }
    // In production, use whitelist from environment variable
    if (env.ALLOWED_ORIGINS) {
        const origins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
        if (origins.length > 0) {
            return origins;
        }
    }
    // Fallback: in production without ALLOWED_ORIGINS, allow all (not recommended)
    if (env.NODE_ENV === 'production') {
        logger.warn('Socket.IO CORS: ALLOWED_ORIGINS not set in production. Allowing all origins (not recommended for security).');
    }
    return true;
};
export const initializeSocket = (httpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: getSocketCorsOrigin(),
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
    });
    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = verifyToken(token);
            socket.userId = decoded.userId;
            next();
        }
        catch (error) {
            next(new Error(`Authentication error: ${error.message}`));
        }
    });
    io.on('connection', (socket) => {
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
        activeUsers.get(userId).add(socket.id);
        // Notify others that this user is online
        socket.broadcast.emit('user-online', { userId });
        // Join user's personal room for direct notifications
        socket.join(`user:${userId}`);
        // Handle joining a chat room
        socket.on('join-chat', async (chatId) => {
            try {
                // Check if already in the room to prevent duplicate joins
                const rooms = Array.from(socket.rooms);
                if (rooms.includes(`chat:${chatId}`)) {
                    return; // Already in the room, skip
                }
                const { error } = await verifyChatAccess(chatId, userId);
                if (error) {
                    socket.emit('error', { message: error.message });
                    return;
                }
                socket.join(`chat:${chatId}`);
                logger.debug(`User joined chat`, { userId, chatId });
            }
            catch (error) {
                logger.error('Error joining chat', { error, userId, chatId });
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });
        // Handle leaving a chat room
        socket.on('leave-chat', (chatId) => {
            // Check if actually in the room before leaving
            const rooms = Array.from(socket.rooms);
            if (!rooms.includes(`chat:${chatId}`)) {
                return; // Not in the room, skip
            }
            socket.leave(`chat:${chatId}`);
            logger.debug(`User left chat`, { userId, chatId });
        });
        // Handle sending a message
        socket.on('send-message', async (data) => {
            try {
                const { chatId, content } = data;
                if (!content || content.trim().length === 0) {
                    socket.emit('error', { message: 'Message content is required' });
                    return;
                }
                // Verify chat exists and user is a participant, or create it
                let chat;
                let actualChatId = chatId;
                // First, try to verify if chatId is an existing chat
                const { chat: existingChat, error: accessError } = await verifyChatAccess(chatId, userId);
                if (accessError) {
                    // Chat doesn't exist, try to create it (chatId might be a userId)
                    const { chat: newChat, error: createError } = await findOrCreateChat(userId, chatId);
                    if (createError) {
                        socket.emit('error', { message: createError.message });
                        return;
                    }
                    chat = newChat;
                    actualChatId = chat._id.toString();
                    // Join the correct chat room
                    if (actualChatId !== chatId) {
                        socket.join(`chat:${actualChatId}`);
                    }
                    // Emit chat-created event to notify clients
                    const otherParticipantId = chat.participants.find((p) => p.toString() !== userId)?.toString();
                    if (otherParticipantId) {
                        io.to(`user:${otherParticipantId}`).emit('chat-created', {
                            chatId: actualChatId,
                            participants: chat.participants.map((p) => p.toString()),
                        });
                    }
                    io.to(`user:${userId}`).emit('chat-created', {
                        chatId: actualChatId,
                        participants: chat.participants.map((p) => p.toString()),
                    });
                }
                else {
                    chat = existingChat;
                }
                // Create and save message
                const savedMessage = await createMessage(chat, {
                    senderId: userId,
                    content,
                });
                if (!savedMessage || !savedMessage._id) {
                    socket.emit('error', { message: 'Failed to retrieve saved message' });
                    return;
                }
                // Format and emit message
                const messagePayload = formatMessagePayload(savedMessage, actualChatId);
                // Emit to all users in the chat room
                io.to(`chat:${actualChatId}`).emit('new-message', { message: messagePayload });
                // For one-on-one chats, get the other participant
                const otherParticipantId = chat.participants.find((p) => p.toString() !== userId)?.toString();
                // Emit to sender's personal room
                io.to(`user:${userId}`).emit('new-message', { message: messagePayload });
                if (otherParticipantId) {
                    io.to(`user:${otherParticipantId}`).emit('new-message', { message: messagePayload });
                }
                // Emit chat update to both participants
                const chatUpdate = {
                    chatId: actualChatId,
                    lastMessage: savedMessage.content || '',
                    timestamp: messagePayload.timestamp,
                };
                if (otherParticipantId) {
                    io.to(`user:${otherParticipantId}`).emit('chat-updated', chatUpdate);
                }
                io.to(`user:${userId}`).emit('chat-updated', chatUpdate);
                // Confirm message sent with actual chatId (in case chat was just created)
                socket.emit('message-sent', {
                    messageId: savedMessage._id.toString(),
                    chatId: actualChatId,
                    wasNewChat: actualChatId !== chatId, // Indicates if chat was just created
                });
            }
            catch (error) {
                logger.error('Error sending message', { error, userId, chatId: data.chatId });
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Handle typing indicator
        socket.on('typing', (data) => {
            socket.to(`chat:${data.chatId}`).emit('user-typing', {
                userId,
                chatId: data.chatId,
                isTyping: data.isTyping,
            });
        });
        // Handle marking messages as read
        socket.on('mark-read', async (data) => {
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
            }
            catch (error) {
                logger.error('Error marking messages as read', { error, userId, chatId: data.chatId });
            }
        });
        // Handle toggling message like
        socket.on('toggle-message-like', async (data) => {
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
            }
            catch (error) {
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
                    // Notify others that this user is offline
                    socket.broadcast.emit('user-offline', { userId });
                }
            }
        });
    });
    return io;
};
// Helper function to check if a user is online
export const isUserOnline = (userId) => {
    return activeUsers.has(userId) && activeUsers.get(userId).size > 0;
};
// Helper function to get online users
export const getOnlineUsers = () => {
    return Array.from(activeUsers.keys());
};
//# sourceMappingURL=socket.js.map