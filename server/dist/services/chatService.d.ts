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
export declare const verifyChatAccess: (chatId: string, userId: string) => Promise<{
    chat: any;
    error?: {
        status: number;
        message: string;
    };
}>;
/**
 * Find or create chat between two users
 * Uses transaction to ensure atomicity of user check and chat creation
 */
export declare const findOrCreateChat: (userId1: string, userId2: string) => Promise<{
    chat: any;
    error?: {
        status: number;
        message: string;
    };
}>;
/**
 * Create and save a message to chat
 */
export declare const createMessage: (chat: any, messageData: MessageData) => Promise<any>;
/**
 * Format message for socket/API response
 */
export declare const formatMessagePayload: (message: any, chatId: string) => {
    id: any;
    chatId: string;
    senderId: any;
    senderName: string;
    senderPicture: string | undefined;
    content: any;
    imageUrl: any;
    voiceMessage: {
        audioUrl: any;
        duration: any;
    } | undefined;
    timestamp: string;
    createdAt: string;
    likedBy: any;
    likesCount: any;
    isSent: boolean;
};
/**
 * Mark messages as read in chat
 */
export declare const markChatMessagesAsRead: (chat: any, userId: string) => Promise<boolean>;
/**
 * Toggle like on a message in chat
 */
export declare const toggleMessageLike: (chat: any, messageId: string, userId: string) => Promise<{
    isLiked: boolean;
    likesCount: number;
    error?: {
        status: number;
        message: string;
    };
}>;
/**
 * Get last message from chat
 */
export declare const getLastMessage: (chat: any) => any;
//# sourceMappingURL=chatService.d.ts.map