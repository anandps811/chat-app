import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import { findOrCreateChat, verifyChatAccess, createMessage, formatMessagePayload, markChatMessagesAsRead, getLastMessage, toggleMessageLike, } from '../services/chatService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError, } from '../utils/errors.js';
import { isUserOnline } from '../config/socket.js';
import { userIdParamSchema, chatIdParamSchema, chatMessageIdParamsSchema, paginationQuerySchema, sendMessageSchema, } from '../validations/chatValidation.js';
/**
 * Get or create a chat between two users
 */
export const getOrCreateChat = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = userIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid user ID format. Please provide a valid user ID.');
    }
    const { userId } = paramValidation.data;
    if (userId === currentUserId) {
        throw new ValidationError('Cannot create chat with yourself. Please select a different user to start a conversation.');
    }
    const { chat, error } = await findOrCreateChat(currentUserId, userId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    res.json({ chat });
});
/**
 * Get all chats for the current user
 */
export const getUserChats = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    const chats = await Chat.find({
        participants: currentUserId,
        deletedBy: { $ne: currentUserId }, // Exclude chats deleted by current user
    })
        .populate('participants', 'name picture email')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();
    // Collect all unique senderIds from all messages across all chats
    const User = (await import('../models/User.js')).default;
    const senderIds = new Set();
    for (const chat of chats) {
        if (chat.messages && Array.isArray(chat.messages)) {
            for (const message of chat.messages) {
                if (message.senderId) {
                    const senderIdStr = typeof message.senderId === 'object' && message.senderId.toString
                        ? message.senderId.toString()
                        : message.senderId.toString();
                    if (senderIdStr) {
                        senderIds.add(senderIdStr);
                    }
                }
            }
        }
    }
    // Batch fetch all senders in a single query
    const sendersMap = new Map();
    if (senderIds.size > 0) {
        const senders = await User.find({
            _id: { $in: Array.from(senderIds) }
        }).select('name picture').lean();
        for (const sender of senders) {
            sendersMap.set(sender._id.toString(), sender);
        }
    }
    // Populate senderId fields using the map
    for (const chat of chats) {
        if (chat.messages && Array.isArray(chat.messages)) {
            for (const message of chat.messages) {
                if (message.senderId) {
                    const senderIdStr = typeof message.senderId === 'object' && message.senderId.toString
                        ? message.senderId.toString()
                        : message.senderId.toString();
                    const sender = sendersMap.get(senderIdStr);
                    if (sender) {
                        message.senderId = sender;
                    }
                }
            }
        }
    }
    // Format chats to include the other participant's info
    const formattedChats = chats.map((chat) => {
        const otherParticipant = chat.participants.find((p) => p._id.toString() !== currentUserId);
        const otherParticipantId = otherParticipant?._id?.toString() || '';
        const lastMessage = getLastMessage(chat);
        // Format timestamp as ISO string
        let timestamp = '';
        if (lastMessage?.createdAt) {
            timestamp = typeof lastMessage.createdAt === 'string'
                ? lastMessage.createdAt
                : new Date(lastMessage.createdAt).toISOString();
        }
        else if (chat.lastMessageAt) {
            timestamp = typeof chat.lastMessageAt === 'string'
                ? chat.lastMessageAt
                : new Date(chat.lastMessageAt).toISOString();
        }
        else if (chat.updatedAt) {
            timestamp = typeof chat.updatedAt === 'string'
                ? chat.updatedAt
                : new Date(chat.updatedAt).toISOString();
        }
        // Calculate unread count: messages sent by others that haven't been read by current user
        const unreadCount = (chat.messages || []).filter((msg) => {
            const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString() || '';
            const isSentByOther = senderId !== currentUserId;
            const readByArray = msg.readBy || [];
            const isReadByCurrentUser = readByArray.some((readerId) => {
                const readerIdStr = readerId?._id?.toString() || readerId?.toString() || '';
                return readerIdStr === currentUserId;
            });
            return isSentByOther && !isReadByCurrentUser;
        }).length;
        // Get online status for the other participant
        const isOnline = otherParticipantId ? isUserOnline(otherParticipantId) : false;
        return {
            id: chat._id.toString(),
            chatId: chat._id.toString(),
            userId: otherParticipantId,
            name: otherParticipant?.name || 'Unknown',
            profileImage: otherParticipant?.picture || '',
            lastMessage: lastMessage?.content || '',
            timestamp: timestamp,
            unreadCount: unreadCount,
            isOnline: isOnline,
        };
    });
    res.json({ chats: formattedChats });
});
/**
 * Get messages for a specific chat or group
 */
export const getChatMessages = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = chatIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid chat ID format. Please provide a valid chat ID.');
    }
    const { chatId } = paramValidation.data;
    // Validate query params
    const queryValidation = paginationQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
        throw new ValidationError(queryValidation.error.issues[0]?.message || 'Invalid pagination parameters. Page and limit must be positive numbers.');
    }
    const { page, limit } = queryValidation.data;
    const skip = (page - 1) * limit;
    const { chat, error } = await verifyChatAccess(chatId, currentUserId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    // Use MongoDB aggregation pipeline for efficient pagination
    // This avoids loading all messages into memory
    const aggregationResult = await Chat.aggregate([
        // Match the specific chat
        { $match: { _id: new mongoose.Types.ObjectId(chatId) } },
        // Unwind messages array to individual documents
        { $unwind: { path: '$messages', preserveNullAndEmptyArrays: false } },
        // Sort messages by createdAt descending (newest first)
        { $sort: { 'messages.createdAt': -1 } },
        // Skip and limit for pagination
        { $skip: skip },
        { $limit: limit },
        // Project only the message fields we need
        {
            $project: {
                _id: '$messages._id',
                senderId: '$messages.senderId',
                content: '$messages.content',
                imageUrl: '$messages.imageUrl',
                voiceMessageUrl: '$messages.voiceMessageUrl',
                voiceMessageDuration: '$messages.voiceMessageDuration',
                readBy: '$messages.readBy',
                likedBy: '$messages.likedBy',
                createdAt: '$messages.createdAt',
                updatedAt: '$messages.updatedAt',
            }
        }
    ]);
    // Reverse to get chronological order (oldest first) for display
    const paginatedMessages = aggregationResult.reverse();
    // If no messages found, return empty array
    if (paginatedMessages.length === 0) {
        res.json({ messages: [] });
        return;
    }
    // Collect all unique senderIds from paginated messages only
    const User = (await import('../models/User.js')).default;
    const senderIds = new Set();
    for (const message of paginatedMessages) {
        if (message.senderId) {
            const senderIdStr = typeof message.senderId === 'object' && message.senderId.toString
                ? message.senderId.toString()
                : message.senderId.toString();
            if (senderIdStr) {
                senderIds.add(senderIdStr);
            }
        }
    }
    // Batch fetch all senders in a single query (optimized: only fetch users for paginated messages)
    const sendersMap = new Map();
    if (senderIds.size > 0) {
        const senders = await User.find({
            _id: { $in: Array.from(senderIds) }
        }).select('name picture').lean();
        for (const sender of senders) {
            sendersMap.set(sender._id.toString(), sender);
        }
    }
    // Populate senderId fields using the map
    for (const message of paginatedMessages) {
        if (message.senderId) {
            const senderIdStr = typeof message.senderId === 'object' && message.senderId.toString
                ? message.senderId.toString()
                : message.senderId.toString();
            const sender = sendersMap.get(senderIdStr);
            if (sender) {
                message.senderId = sender;
            }
        }
    }
    // Format messages for API response using shared formatter
    const formattedMessages = paginatedMessages.map((msg) => formatMessagePayload(msg, chatId));
    res.json({ messages: formattedMessages });
});
/**
 * Send a message (REST endpoint - socket is primary method)
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = chatIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid chat ID format. Please provide a valid chat ID.');
    }
    const { chatId } = paramValidation.data;
    // Validate body
    const bodyValidation = sendMessageSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        throw new ValidationError(bodyValidation.error.issues[0]?.message || 'Invalid message data. Please provide valid message content, image URL, or voice message.');
    }
    const { content, imageUrl, voiceMessageUrl, voiceMessageDuration } = bodyValidation.data;
    const { chat, error } = await verifyChatAccess(chatId, currentUserId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    const savedMessage = await createMessage(chat, {
        senderId: currentUserId,
        ...(content && { content }),
        ...(imageUrl && { imageUrl }),
        ...(voiceMessageUrl && { voiceMessageUrl }),
        ...(voiceMessageDuration !== undefined && { voiceMessageDuration }),
    });
    res.status(201).json({ message: savedMessage });
});
/**
 * Mark messages as read
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = chatIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid chat ID format. Please provide a valid chat ID.');
    }
    const { chatId } = paramValidation.data;
    const { chat, error } = await verifyChatAccess(chatId, currentUserId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    await markChatMessagesAsRead(chat, currentUserId);
    res.json({ success: true });
});
/**
 * Toggle like on a message
 */
export const toggleMessageLikeController = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = chatMessageIdParamsSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid chat or message ID format. Please provide valid IDs.');
    }
    const { chatId, messageId } = paramValidation.data;
    const { chat, error } = await verifyChatAccess(chatId, currentUserId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    const result = await toggleMessageLike(chat, messageId, currentUserId);
    if (result.error) {
        if (result.error.status === 404) {
            throw new NotFoundError(result.error.message);
        }
        else {
            throw new ValidationError(result.error.message);
        }
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
export const deleteChat = asyncHandler(async (req, res) => {
    const authReq = req;
    const currentUserId = authReq.user?.userId;
    if (!currentUserId) {
        throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
    }
    // Validate params
    const paramValidation = chatIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
        throw new ValidationError(paramValidation.error.issues[0]?.message || 'Invalid chat ID format. Please provide a valid chat ID.');
    }
    const { chatId } = paramValidation.data;
    const { chat, error } = await verifyChatAccess(chatId, currentUserId);
    if (error) {
        if (error.status === 404) {
            throw new NotFoundError(error.message);
        }
        else if (error.status === 403) {
            throw new ForbiddenError(error.message);
        }
        else {
            throw new ValidationError(error.message);
        }
    }
    // Add current user to deletedBy array if not already present
    const userIdObject = new mongoose.Types.ObjectId(currentUserId);
    if (!chat.deletedBy || !chat.deletedBy.some((id) => id.toString() === currentUserId)) {
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
//# sourceMappingURL=chat.controller.js.map