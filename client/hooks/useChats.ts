import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { ChatPreview } from '../types';

interface BackendChat {
  id: string;
  chatId: string;
  userId: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  return date.toLocaleDateString();
};

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiService.getUserChats();
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received');
      }
      // Transform backend chat format to ChatPreview format
      const formattedChats: ChatPreview[] = response.data.chats.map((chat: BackendChat) => ({
        id: chat.chatId,
        name: chat.name,
        lastMessage: chat.lastMessage || 'No messages yet',
        time: formatTimestamp(chat.timestamp),
        unreadCount: chat.unreadCount || 0,
        isOnline: chat.isOnline || false,
        avatar: chat.profileImage || '',
      }));
      return formattedChats;
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await apiService.deleteChat(chatId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
