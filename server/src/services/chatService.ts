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
 * Also handles group chats by checking if chatId is a groupId
 * Returns Group for group chats, Chat for regular chats
 */
export const verifyChatAccess = async (
  chatId: string,
  userId: string
): Promise<{ chat: any; isGroup: boolean; error?: { status: number; message: string } }> => {
  // First, try to find a Chat document with this ID (regular chat)
  let chat = await Chat.findById(chatId);
  
  if (chat) {
    // Verify user is a participant
    if (!chat.participants.some((p: any) => p.toString() === userId)) {
      return { chat: null, isGroup: false, error: { status: 403, message: 'Access denied' } };
    }
    return { chat, isGroup: false };
  }
  
  // If no chat found, check if it's a group ID
  const group = await Group.findById(chatId);
  if (group) {
    // Check if user is a member of the group
    const isMember = group.members.some((m: any) => m.toString() === userId);
    if (!isMember) {
      return { chat: null, isGroup: true, error: { status: 403, message: 'Access denied' } };
    }
    // Return group for group chats (messages are stored in Group)
    return { chat: group, isGroup: true };
  }
  
  return { chat: null, isGroup: false, error: { status: 404, message: 'Chat not found' } };
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
 * Create and save a message to chat or group
 * chat can be either a Chat document or Group document
 */
export const createMessage = async (
  chat: any,
  messageData: MessageData,
  isGroup: boolean = false
): Promise<any> => {
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

  // Reload to get populated message with _id
  let chatWithMessage;
  if (isGroup) {
    chatWithMessage = await Group.findById(chat._id)
      .populate('messages.senderId', 'name picture')
      .lean();
  } else {
    chatWithMessage = await Chat.findById(chat._id)
      .populate('messages.senderId', 'name picture')
      .lean();
  }

  if (!chatWithMessage?.messages || chatWithMessage.messages.length === 0) {
    throw new Error('Failed to save message');
  }

  return chatWithMessage.messages[chatWithMessage.messages.length - 1];
};

/**
 * Format message for socket/API response
 */
export const formatMessagePayload = (message: any, chatId: string) => {
  // Handle populated senderId (object with _id, name, picture) or ObjectId
  let senderId: any = message.senderId;
  
  // If senderId is populated (object), keep it as is for frontend
  // If it's just an ObjectId, we'll need to populate it elsewhere
  if (senderId && typeof senderId === 'object' && senderId._id) {
    // Already populated, use as is
    senderId = {
      _id: senderId._id.toString(),
      name: senderId.name || 'Unknown',
      picture: senderId.picture,
    };
  } else if (senderId && typeof senderId === 'object') {
    // Might be ObjectId, convert to string
    senderId = senderId.toString();
  }

  // Handle likedBy array - convert to array of user IDs
  const likedBy = (message.likedBy || []).map((id: any) => 
    id?._id?.toString() || id?.toString() || id
  );

  return {
    id: message._id?.toString() || message.id || '',
    chatId: chatId,
    senderId: senderId,
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
    likedBy: likedBy,
    likesCount: likedBy.length,
    isSent: false,
  };
};

/**
 * Mark messages as read in chat or group
 * chat can be either a Chat document or Group document
 */
export const markChatMessagesAsRead = async (
  chat: any,
  userId: string
): Promise<boolean> => {
  let hasChanges = false;
  
  chat.messages.forEach((msg: any) => {
    if (
      msg.senderId.toString() !== userId &&
      !msg.readBy.some((id: any) => id.toString() === userId)
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
 * Toggle like on a message in chat or group
 * chat can be either a Chat document or Group document
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

