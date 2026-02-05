/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import { BackendChatResponse, BackendMessage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('accessToken');
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  /**
   * Make an authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async login(emailOrPhone: string, password: string) {
    const response = await this.request<{
      accessToken: string;
      user: { id: string; name: string; email: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });

    if (response.data) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async signup(name: string, email: string, mobileNumber: string, password: string) {
    const response = await this.request<{
      accessToken: string;
      user: { id: string; name: string; email: string };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, mobileNumber, password }),
    });

    if (response.data) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async refreshToken() {
    const response = await this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent
    });

    if (response.data) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.setAccessToken(null);
    return response;
  }

  // Chat endpoints
  async getUserChats() {
    return this.request<{
      chats: Array<{
        id: string;
        chatId: string;
        userId: string;
        name: string;
        profileImage: string;
        lastMessage: string;
        timestamp: string;
        unreadCount: number;
        isOnline: boolean;
      }>;
    }>('/chats');
  }

  async getOrCreateChat(userId: string) {
    return this.request<{ chat: BackendChatResponse }>(`/chats/${userId}`);
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50) {
    return this.request<{
      messages: Array<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        senderPicture?: string;
        createdAt: string;
        imageUrl?: string;
        voiceMessageUrl?: string;
        likesCount: number;
        isLiked: boolean;
      }>;
    }>(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(
    chatId: string,
    content: string,
    imageUrl?: string,
    voiceMessageUrl?: string,
    voiceMessageDuration?: number
  ) {
    return this.request<{ message: BackendMessage }>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        imageUrl,
        voiceMessageUrl,
        voiceMessageDuration,
      }),
    });
  }

  async markMessagesAsRead(chatId: string) {
    return this.request(`/chats/${chatId}/read`, {
      method: 'PUT',
    });
  }

  async toggleMessageLike(chatId: string, messageId: string) {
    return this.request<{
      success: boolean;
      isLiked: boolean;
      likesCount: number;
    }>(`/chats/${chatId}/messages/${messageId}/like`, {
      method: 'PUT',
    });
  }

  async deleteChat(chatId: string) {
    return this.request(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // User endpoints (if available)
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    bio?: string;
    picture?: string;
  }) {
    // This endpoint might need to be added to the backend
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async searchUsers(query: string) {
    // This endpoint might need to be added to the backend
    return this.request<{ users: Array<{ id: string; name: string; email: string; picture?: string }> }>(
      `/users/search?q=${encodeURIComponent(query)}`
    );
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
