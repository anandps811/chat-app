import { Request, Response } from 'express';
/**
 * Get or create a chat between two users
 */
export declare const getOrCreateChat: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get all chats for the current user
 */
export declare const getUserChats: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get messages for a specific chat or group
 */
export declare const getChatMessages: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Send a message (REST endpoint - socket is primary method)
 */
export declare const sendMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Mark messages as read
 */
export declare const markMessagesAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Toggle like on a message
 */
export declare const toggleMessageLikeController: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete a chat (soft delete - removes from user's view)
 * Note: Groups cannot be deleted this way, only regular chats
 */
export declare const deleteChat: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=chat.controller.d.ts.map