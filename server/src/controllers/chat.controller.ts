import { Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import Group from '../models/Group.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  findOrCreateChat,
  verifyChatAccess,
  createMessage,
  formatMessagePayload,
  markChatMessagesAsRead,
  getLastMessage,
  toggleMessageLike,
} from '../services/chatService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '../utils/errors.js';

/**
 * Get or create a chat between two users
 */
export const getOrCreateChat = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  if (userId === currentUserId) {
    throw new ValidationError('Cannot create chat with yourself');
  }

  const { chat, error } = await findOrCreateChat(currentUserId, userId);
  
  if (error) {
    throw new Error(error.message);
  }

  res.json({ chat });
});

/**
 * Get all chats for the current user
 */
export const getUserChats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

    const chats = await Chat.find({
      participants: currentUserId,
      deletedBy: { $ne: currentUserId }, // Exclude chats deleted by current user
    })
      .populate('participants', 'name picture email')
      .populate('messages.senderId', 'name picture')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Format chats to include the other participant's info
    const formattedChats = chats.map((chat: any) => {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== currentUserId
      );
      const lastMessage = getLastMessage(chat);
      
      // Format timestamp as ISO string
      let timestamp: string = '';
      if (lastMessage?.createdAt) {
        timestamp = typeof lastMessage.createdAt === 'string' 
          ? lastMessage.createdAt 
          : new Date(lastMessage.createdAt).toISOString();
      } else if (chat.lastMessageAt) {
        timestamp = typeof chat.lastMessageAt === 'string'
          ? chat.lastMessageAt
          : new Date(chat.lastMessageAt).toISOString();
      } else if (chat.updatedAt) {
        timestamp = typeof chat.updatedAt === 'string'
          ? chat.updatedAt
          : new Date(chat.updatedAt).toISOString();
      }

      // Calculate unread count: messages sent by others that haven't been read by current user
      const unreadCount = (chat.messages || []).filter((msg: any) => {
        const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString() || '';
        const isSentByOther = senderId !== currentUserId;
        const readByArray = msg.readBy || [];
        const isReadByCurrentUser = readByArray.some((readerId: any) => {
          const readerIdStr = readerId?._id?.toString() || readerId?.toString() || '';
          return readerIdStr === currentUserId;
        });
        return isSentByOther && !isReadByCurrentUser;
      }).length;

      return {
        id: chat._id.toString(),
        chatId: chat._id.toString(),
        userId: otherParticipant?._id?.toString() || '',
        name: otherParticipant?.name || 'Unknown',
        profileImage: otherParticipant?.picture || '',
        lastMessage: lastMessage?.content || '',
        timestamp: timestamp,
        unreadCount: unreadCount,
        isOnline: false, // TODO: Get from socket connections
      };
    });

  res.json({ chats: formattedChats });
});

/**
 * Get messages for a specific chat or group
 */
export const getChatMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const currentUserId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { chat, isGroup, error } = await verifyChatAccess(chatId, currentUserId);
  if (error) {
    throw new Error(error.message);
  }

    // Get messages from embedded array in chat/group document
    let chatWithMessages;
    if (isGroup) {
      chatWithMessages = await Group.findById(chatId)
        .populate('messages.senderId', 'name picture')
        .lean();
    } else {
      chatWithMessages = await Chat.findById(chatId)
        .populate('messages.senderId', 'name picture')
        .lean();
    }

  if (!chatWithMessages) {
    throw new NotFoundError('Chat not found');
  }

    // Sort messages by createdAt and apply pagination
    const allMessages = (chatWithMessages.messages || []).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginatedMessages = allMessages.slice(skip, skip + limit);
    
    // Reverse to get chronological order
    paginatedMessages.reverse();

    // Format messages for API response using shared formatter
    const formattedMessages = paginatedMessages.map((msg: any) =>
      formatMessagePayload(msg, chatId)
    );

  res.json({ messages: formattedMessages });
});

/**
 * Send a message (REST endpoint - socket is primary method)
 */
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { content, imageUrl, voiceMessageUrl, voiceMessageDuration } = req.body;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  if (!content && !imageUrl && !voiceMessageUrl) {
    throw new ValidationError('Message content, image, or voice message is required');
  }

  const { chat, isGroup, error } = await verifyChatAccess(chatId, currentUserId);
  if (error) {
    throw new Error(error.message);
  }

    const savedMessage = await createMessage(chat, {
      senderId: currentUserId,
      content,
      imageUrl,
      voiceMessageUrl,
      voiceMessageDuration,
    }, isGroup);

  res.status(201).json({ message: savedMessage });
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { chat, error } = await verifyChatAccess(chatId, currentUserId);
  if (error) {
    throw new Error(error.message);
  }

  await markChatMessagesAsRead(chat, currentUserId);
  res.json({ success: true });
});

/**
 * Toggle like on a message
 */
export const toggleMessageLikeController = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId, messageId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  if (!messageId) {
    throw new ValidationError('Message ID is required');
  }

  const { chat, error } = await verifyChatAccess(chatId, currentUserId);
  if (error) {
    throw new Error(error.message);
  }

  const result = await toggleMessageLike(chat, messageId, currentUserId);
  if (result.error) {
    throw new Error(result.error.message);
  }

  res.json({
    success: true,
    isLiked: result.isLiked,
    likesCount: result.likesCount,
  });
});

/**
 * Delete a chat (soft delete - removes from user's view)
 * Note: Groups cannot be deleted this way, only regular chats
 */
export const deleteChat = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { chat, isGroup, error } = await verifyChatAccess(chatId, currentUserId);
  if (error) {
    throw new Error(error.message);
  }

  // Groups cannot be deleted this way
  if (isGroup) {
    throw new ValidationError('Groups cannot be deleted. Leave the group instead.');
  }

    // Add current user to deletedBy array if not already present
    const userIdObject = new mongoose.Types.ObjectId(currentUserId);
    if (!chat.deletedBy || !chat.deletedBy.some((id: any) => id.toString() === currentUserId)) {
      if (!chat.deletedBy) {
        chat.deletedBy = [];
      }
      chat.deletedBy.push(userIdObject);
      await chat.save();
    }

  res.json({
    success: true,
    message: 'Chat deleted successfully',
  });
});

