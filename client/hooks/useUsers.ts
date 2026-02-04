import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export const useSearchUsers = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const response = await apiService.searchUsers(query);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received');
      }
      return response.data.users.map((user: User) => ({
        id: user.id,
        name: user.name,
        subtitle: user.email,
        avatar: user.picture,
        initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      }));
    },
    enabled: enabled && query.trim().length > 0,
  });
};

export const useGetOrCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiService.getOrCreateChat(userId);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data || !response.data.chat) {
        throw new Error('No chat data received');
      }
      const chat = response.data.chat;
      // Ensure we return the chat with a properly formatted ID
      return {
        ...chat,
        id: chat._id?.toString() || chat.id?.toString() || chat,
        _id: chat._id?.toString() || chat._id || chat.id,
      };
    },
    onSuccess: () => {
      // Invalidate chats to refresh the list
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      name?: string;
      email?: string;
      bio?: string;
      picture?: string;
    }) => {
      const response = await apiService.updateProfile(profileData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
