import express from 'express';
import {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  toggleMessageLikeController,
  deleteChat,
} from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Get or create a chat with a user
router.get('/:userId', getOrCreateChat);

// Get all chats for the current user
router.get('/', getUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', getChatMessages);

// Send a message (REST fallback - socket is primary)
router.post('/:chatId/messages', sendMessage);

// Mark messages as read
router.put('/:chatId/read', markMessagesAsRead);

// Toggle like on a message
router.put('/:chatId/messages/:messageId/like', toggleMessageLikeController);

// Delete a chat
router.delete('/:chatId', deleteChat);

export default router;

