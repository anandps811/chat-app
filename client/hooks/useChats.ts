import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { ChatPreview, MessagesQueryData } from '../types';

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
      // Ensure chats is an array
      const chatsArray = Array.isArray(response.data.chats) ? response.data.chats : [];
      // Transform backend chat format to ChatPreview format
      const formattedChats: ChatPreview[] = chatsArray.map((chat: BackendChat) => ({
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
    // Ensure we always return an array, even if query fails
    placeholderData: [],
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
    // Optimistic update: remove chat immediately
    onMutate: async (chatId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot the previous values
      const previousChats = queryClient.getQueryData<ChatPreview[]>(['chats']);
      const previousMessages = queryClient.getQueryData<MessagesQueryData>(['messages', chatId]);

      // Optimistically remove the chat
      if (Array.isArray(previousChats)) {
        const updatedChats = previousChats.filter((chat) => chat.id !== chatId);
        queryClient.setQueryData<ChatPreview[]>(['chats'], updatedChats);
      }

      // Remove messages for this chat
      queryClient.removeQueries({ queryKey: ['messages', chatId] });

      // Return context for rollback
      return { previousChats, previousMessages };
    },
    // On error, rollback to previous state
    onError: (_err, chatId, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(['chats'], context.previousChats);
      }
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', chatId], context.previousMessages);
      }
    },
    // On success, invalidate to ensure consistency
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
