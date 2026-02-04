import Chat from '../models/Chat.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export interface MessageData {
  senderId: string;
  content?: string;
  imageUrl?: string;
  voiceMessageUrl?: string;
  voiceMessageDuration?: number;
}

/**
 * Verify chat exists and user is a participant
 */
export const verifyChatAccess = async (
  chatId: string,
  userId: string
): Promise<{ chat: any; error?: { status: number; message: string } }> => {
  const chat = await Chat.findById(chatId);
  
  if (!chat) {
    return { chat: null, error: { status: 404, message: 'Chat not found' } };
  }
  
  // Verify user is a participant
  if (!chat.participants.some((p: any) => p.toString() === userId)) {
    return { chat: null, error: { status: 403, message: 'Access denied' } };
  }
  
  return { chat };
};

/**
 * Find or create chat between two users
 */
export const findOrCreateChat = async (
  userId1: string,
  userId2: string
): Promise<{ chat: any; error?: { status: number; message: string } }> => {
  // Check if other user exists
  const otherUser = await User.findById(userId2);
  if (!otherUser) {
    return { chat: null, error: { status: 404, message: 'User not found' } };
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [userId1, userId2] },
  }).populate('participants', 'name picture email');

  if (!chat) {
    // Create new chat
    chat = new Chat({
      participants: [userId1, userId2],
    });
    await chat.save();
    await chat.populate('participants', 'name picture email');
  }

  return { chat };
};

/**
 * Create and save a message to chat
 */
export const createMessage = async (
  chat: any,
  messageData: MessageData
): Promise<any> => {
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

  chat.messages.push(newMessage as any);
  chat.lastMessageAt = new Date();
  await chat.save();

  // Reload to get the saved message with _id
  const chatWithMessage = await Chat.findById(chat._id).lean();
  
  if (!chatWithMessage?.messages || chatWithMessage.messages.length === 0) {
    throw new Error('Failed to save message');
  }

  // Get the last message and populate its senderId
  const lastMessage = chatWithMessage.messages[chatWithMessage.messages.length - 1];
  if (lastMessage.senderId) {
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
export const formatMessagePayload = (message: any, chatId: string) => {
  // Handle populated senderId (object with _id, name, picture) or ObjectId
  let senderId: any = message.senderId;
  let senderName: string = 'Unknown';
  let senderPicture: string | undefined;
  
  // If senderId is populated (object), extract name and picture
  if (senderId && typeof senderId === 'object' && senderId._id) {
    // Already populated, extract name and picture
    senderName = senderId.name || 'Unknown';
    senderPicture = senderId.picture;
    senderId = senderId._id.toString();
  } else if (senderId && typeof senderId === 'object') {
    // Might be ObjectId, convert to string
    senderId = senderId.toString();
  } else if (typeof senderId === 'string') {
    // Already a string, keep as is
  }

  // Handle likedBy array - convert to array of user IDs
  const likedBy = (message.likedBy || []).map((id: any) => 
    id?._id?.toString() || id?.toString() || id
  );

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
export const markChatMessagesAsRead = async (
  chat: any,
  userId: string
): Promise<boolean> => {
  // Ensure messages array exists
  if (!chat.messages || !Array.isArray(chat.messages)) {
    return false;
  }

  let hasChanges = false;
  
  chat.messages.forEach((msg: any) => {
    // Ensure readBy array exists
    if (!msg.readBy) {
      msg.readBy = [];
    }

    const senderIdStr = msg.senderId?.toString() || (typeof msg.senderId === 'object' && msg.senderId._id ? msg.senderId._id.toString() : '');
    
    if (
      senderIdStr !== userId &&
      !msg.readBy.some((id: any) => {
        const idStr = id?.toString() || (typeof id === 'object' && id._id ? id._id.toString() : '');
        return idStr === userId;
      })
    ) {
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
export const toggleMessageLike = async (
  chat: any,
  messageId: string,
  userId: string
): Promise<{ isLiked: boolean; likesCount: number; error?: { status: number; message: string } }> => {
  const message = chat.messages.id(messageId);
  
  if (!message) {
    return { isLiked: false, likesCount: 0, error: { status: 404, message: 'Message not found' } };
  }

  const likedByArray = message.likedBy || [];
  const userIdObjectId = new mongoose.Types.ObjectId(userId);
  const userLikedIndex = likedByArray.findIndex(
    (id: any) => id.toString() === userId
  );

  let isLiked: boolean;

  if (userLikedIndex === -1) {
    // User hasn't liked, add like
    likedByArray.push(userIdObjectId);
    isLiked = true;
  } else {
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
export const getLastMessage = (chat: any) => {
  const messages = chat.messages || [];
  if (messages.length === 0) return null;
  
  return messages.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};

