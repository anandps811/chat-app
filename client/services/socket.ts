/**
 * Socket.IO Client Service
 * Handles real-time messaging via WebSocket
 */

import { io, Socket } from 'socket.io-client';
import {
  SocketMessageEvent,
  SocketMessageSentEvent,
  SocketMessageReadEvent,
  SocketMessageLikedEvent,
  SocketUserStatusEvent,
  SocketChatUpdatedEvent,
  SocketChatCreatedEvent,
  SocketTypingEvent,
} from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private joinedChats: Set<string> = new Set(); // Track joined chats to prevent duplicates

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedChats.clear(); // Clear joined chats on disconnect
    }
  }

  // Send a message via socket
  sendMessage(chatId: string, content: string, imageUrl?: string, voiceMessageUrl?: string, voiceMessageDuration?: number) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send-message', {
      chatId,
      content,
      imageUrl,
      voiceMessageUrl,
      voiceMessageDuration,
    });
  }

  // Join a chat room
  joinChat(chatId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join chat:', chatId);
      return;
    }

    // Prevent duplicate joins
    if (this.joinedChats.has(chatId)) {
      return;
    }

    this.socket.emit('join-chat', chatId);
    this.joinedChats.add(chatId);
  }

  // Leave a chat room
  leaveChat(chatId: string) {
    if (!this.socket?.connected) {
      return;
    }

    // Only leave if we actually joined
    if (!this.joinedChats.has(chatId)) {
      return;
    }

    this.socket.emit('leave-chat', chatId);
    this.joinedChats.delete(chatId);
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('mark-read', { chatId });
  }

  // Toggle message like
  toggleLike(chatId: string, messageId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('toggle-message-like', { chatId, messageId });
  }

  // Event listeners
  onMessage(callback: (data: SocketMessageEvent) => void) {
    if (!this.socket) return () => {};
    
    // Add listener - Socket.IO allows multiple listeners per event
    // Each component manages its own listener via the cleanup function
    this.socket.on('new-message', callback);
    return () => {
      // Remove only this specific callback to avoid affecting other listeners
      this.socket?.off('new-message', callback);
    };
  }

  onMessageSent(callback: (data: SocketMessageSentEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('message-sent', callback);
    return () => {
      this.socket?.off('message-sent', callback);
    };
  }

  onMessageRead(callback: (data: SocketMessageReadEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('messages-read', callback);
    return () => {
      this.socket?.off('messages-read', callback);
    };
  }

  onMessageLiked(callback: (data: SocketMessageLikedEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('message-liked', callback);
    return () => {
      this.socket?.off('message-liked', callback);
    };
  }

  onUserOnline(callback: (data: SocketUserStatusEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('user-online', callback);
    return () => {
      this.socket?.off('user-online', callback);
    };
  }

  onUserOffline(callback: (data: SocketUserStatusEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('user-offline', callback);
    return () => {
      this.socket?.off('user-offline', callback);
    };
  }

  onChatUpdated(callback: (data: SocketChatUpdatedEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('chat-updated', callback);
    return () => {
      this.socket?.off('chat-updated', callback);
    };
  }

  onChatCreated(callback: (data: SocketChatCreatedEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('chat-created', callback);
    return () => {
      this.socket?.off('chat-created', callback);
    };
  }

  onTyping(callback: (data: SocketTypingEvent) => void) {
    if (!this.socket) return () => {};
    
    this.socket.on('typing', callback);
    return () => {
      this.socket?.off('typing', callback);
    };
  }

  // Send typing indicator
  sendTyping(chatId: string, isTyping: boolean) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing', { chatId, isTyping });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
