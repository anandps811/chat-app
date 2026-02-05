import Chat from '../models/Chat.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { UnprocessableEntityError, NotFoundError } from '../utils/errors.js';
import { withTransaction } from '../utils/transaction.js';
/**
 * Verify chat exists and user is a participant
 */
export const verifyChatAccess = async (chatId, userId) => {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return { chat: null, error: { status: 404, message: 'Chat not found. The chat you are trying to access does not exist.' } };
    }
    // Verify user is a participant
    if (!chat.participants.some((p) => p.toString() === userId)) {
        return { chat: null, error: { status: 403, message: 'Access denied. You do not have permission to access this chat.' } };
    }
    return { chat };
};
/**
 * Find or create chat between two users
 * Uses transaction to ensure atomicity of user check and chat creation
 */
export const findOrCreateChat = async (userId1, userId2) => {
    try {
        // Use transaction to ensure user check and chat creation are atomic
        const result = await withTransaction(async (session) => {
            // Check if other user exists
            const otherUser = await User.findById(userId2).session(session);
            if (!otherUser) {
                throw new Error('USER_NOT_FOUND');
            }
            // Check if chat already exists
            let chat = await Chat.findOne({
                participants: { $all: [userId1, userId2] },
            }).session(session).populate('participants', 'name picture email');
            if (!chat) {
                // Create new chat within transaction
                const chats = await Chat.create([{
                        participants: [userId1, userId2],
                    }], { session });
                const newChat = chats[0];
                if (!newChat) {
                    throw new Error('FAILED_TO_CREATE_CHAT');
                }
                chat = newChat;
                await chat.populate('participants', 'name picture email');
            }
            return chat;
        });
        return { chat: result };
    }
    catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return { chat: null, error: { status: 404, message: 'User not found. The user you are trying to chat with does not exist.' } };
        }
        if (error.message === 'FAILED_TO_CREATE_CHAT') {
            return { chat: null, error: { status: 500, message: 'Failed to create chat. Please try again or contact support if the problem persists.' } };
        }
        // Re-throw other errors
        throw error;
    }
};
/**
 * Create and save a message to chat
 */
export const createMessage = async (chat, messageData) => {
    // Ensure messages array exists
    if (!chat.messages) {
        chat.messages = [];
    }
    const newMessage = {
        senderId: new mongoose.Types.ObjectId(messageData.senderId),
        content: messageData.content,
        imageUrl: messageData.imageUrl,
        voiceMessageUrl: messageData.voiceMessageUrl,
        voiceMessageDuration: messageData.voiceMessageDuration,
        readBy: [new mongoose.Types.ObjectId(messageData.senderId)],
    };
    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    await chat.save();
    // Reload to get the saved message with _id
    const chatWithMessage = await Chat.findById(chat._id).lean();
    if (!chatWithMessage?.messages || chatWithMessage.messages.length === 0) {
        throw new UnprocessableEntityError('Failed to save message. Please try again or contact support if the problem persists.');
    }
    // Get the last message and populate its senderId
    const lastMessage = chatWithMessage.messages[chatWithMessage.messages.length - 1];
    if (!lastMessage) {
        throw new NotFoundError('Failed to retrieve the saved message. The message may not have been saved correctly.');
    }
    if (lastMessage.senderId) {
        // Use findById for single message (not N+1 since it's just one query)
        const sender = await User.findById(lastMessage.senderId).select('name picture').lean();
        if (sender) {
            lastMessage.senderId = sender;
        }
    }
    return lastMessage;
};
/**
 * Format message for socket/API response
 */
export const formatMessagePayload = (message, chatId) => {
    // Handle populated senderId (object with _id, name, picture) or ObjectId
    let senderId = message.senderId;
    let senderName = 'Unknown';
    let senderPicture;
    // If senderId is populated (object), extract name and picture
    if (senderId && typeof senderId === 'object' && senderId._id) {
        // Already populated, extract name and picture
        senderName = senderId.name || 'Unknown';
        senderPicture = senderId.picture;
        senderId = senderId._id.toString();
    }
    else if (senderId && typeof senderId === 'object') {
        // Might be ObjectId, convert to string
        senderId = senderId.toString();
    }
    else if (typeof senderId === 'string') {
        // Already a string, keep as is
    }
    // Handle likedBy array - convert to array of user IDs
    const likedBy = (message.likedBy || []).map((id) => id?._id?.toString() || id?.toString() || id);
    return {
        id: message._id?.toString() || message.id || '',
        chatId: chatId,
        senderId: senderId,
        senderName: senderName,
        senderPicture: senderPicture,
        content: message.content,
        imageUrl: message.imageUrl,
        voiceMessage: message.voiceMessageUrl
            ? {
                audioUrl: message.voiceMessageUrl,
                duration: message.voiceMessageDuration || 0,
            }
            : undefined,
        timestamp: message.createdAt
            ? new Date(message.createdAt).toISOString()
            : new Date().toISOString(),
        createdAt: message.createdAt
            ? new Date(message.createdAt).toISOString()
            : new Date().toISOString(),
        likedBy: likedBy,
        likesCount: likedBy.length,
        isSent: false,
    };
};
/**
 * Mark messages as read in chat
 */
export const markChatMessagesAsRead = async (chat, userId) => {
    // Ensure messages array exists
    if (!chat.messages || !Array.isArray(chat.messages)) {
        return false;
    }
    let hasChanges = false;
    chat.messages.forEach((msg) => {
        // Ensure readBy array exists
        if (!msg.readBy) {
            msg.readBy = [];
        }
        const senderIdStr = msg.senderId?.toString() || (typeof msg.senderId === 'object' && msg.senderId._id ? msg.senderId._id.toString() : '');
        if (senderIdStr !== userId &&
            !msg.readBy.some((id) => {
                const idStr = id?.toString() || (typeof id === 'object' && id._id ? id._id.toString() : '');
                return idStr === userId;
            })) {
            msg.readBy.push(new mongoose.Types.ObjectId(userId));
            hasChanges = true;
        }
    });
    if (hasChanges) {
        await chat.save();
    }
    return hasChanges;
};
/**
 * Toggle like on a message in chat
 */
export const toggleMessageLike = async (chat, messageId, userId) => {
    const message = chat.messages.id(messageId);
    if (!message) {
        return { isLiked: false, likesCount: 0, error: { status: 404, message: 'Message not found. The message you are trying to like does not exist in this chat.' } };
    }
    const likedByArray = message.likedBy || [];
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const userLikedIndex = likedByArray.findIndex((id) => id.toString() === userId);
    let isLiked;
    if (userLikedIndex === -1) {
        // User hasn't liked, add like
        likedByArray.push(userIdObjectId);
        isLiked = true;
    }
    else {
        // User has liked, remove like
        likedByArray.splice(userLikedIndex, 1);
        isLiked = false;
    }
    message.likedBy = likedByArray;
    await chat.save();
    return {
        isLiked,
        likesCount: likedByArray.length,
    };
};
/**
 * Get last message from chat
 */
export const getLastMessage = (chat) => {
    const messages = chat.messages || [];
    if (messages.length === 0)
        return null;
    return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
};
//# sourceMappingURL=chatService.js.map