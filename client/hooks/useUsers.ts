import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { ChatPreview } from '../types';

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
      // Extract chatId consistently - backend returns _id as ObjectId or string
      let chatIdStr: string;
      
      // Helper to extract ID from various formats
      const extractId = (id: unknown): string | null => {
        if (!id) return null;
        if (typeof id === 'string') return id;
        if (typeof id === 'object') {
          if ('toString' in id && typeof (id as { toString: () => string }).toString === 'function') {
            return (id as { toString: () => string }).toString();
          }
          if ('_id' in id) {
            return extractId((id as { _id: unknown })._id);
          }
        }
        return String(id);
      };
      
      const extractedId = extractId(chat._id) || extractId(chat.id) || extractId((chat as { chatId?: unknown }).chatId);
      
      if (!extractedId) {
        throw new Error('Chat ID not found in response');
      }
      
      chatIdStr = extractedId;
      
      return {
        ...chat,
        id: chatIdStr,
        _id: chatIdStr,
        chatId: chatIdStr, // Add chatId for consistency with getUserChats format
      };
    },
    // Optimistic update: add chat to list immediately after creation
    onMutate: async (_userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous value
      const previousChats = queryClient.getQueryData<ChatPreview[]>(['chats']);

      // Return context for rollback
      return { previousChats };
    },
    // On error, rollback to previous state
    onError: (_err, _userId, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(['chats'], context.previousChats);
      }
    },
    // On success, add the new chat to the list optimistically
    onSuccess: (data) => {
      const previousChats = queryClient.getQueryData<ChatPreview[]>(['chats']);
      // Ensure previousChats is an array
      const chatsArray = Array.isArray(previousChats) ? previousChats : [];
      
      if (data) {
        // Extract chatId consistently - prefer chatId, then id, then _id
        const chatData = data as { 
          chatId?: unknown;
          id?: unknown;
          _id?: unknown;
          name?: string; 
          profileImage?: string; 
          picture?: string;
          participants?: Array<{ name?: string; picture?: string }>;
        };
        
        // Helper to extract ID from various formats
        const extractId = (id: unknown): string | null => {
          if (!id) return null;
          if (typeof id === 'string') return id;
          if (typeof id === 'object') {
            if ('toString' in id && typeof (id as { toString: () => string }).toString === 'function') {
              return (id as { toString: () => string }).toString();
            }
          }
          return String(id);
        };
        
        const chatIdString = extractId(chatData.chatId) || extractId(chatData.id) || extractId(chatData._id);
        
        if (chatIdString) {
          // Check if chat already exists
          const chatExists = chatsArray.some((chat) => chat.id === chatIdString);
          if (!chatExists) {
            // Try to get name from participants if available
            let chatName = chatData.name || 'New Chat';
            let chatAvatar = chatData.profileImage || chatData.picture || '';
            
            if (chatData.participants && Array.isArray(chatData.participants) && chatData.participants.length > 0) {
              const otherParticipant = chatData.participants.find((p) => {
                // Find first participant with a name
                return p.name;
              });
              if (otherParticipant) {
                chatName = otherParticipant.name || chatName;
                chatAvatar = otherParticipant.picture || chatAvatar;
              }
            }
            
            const newChat: ChatPreview = {
              id: chatIdString,
              name: chatName,
              lastMessage: 'No messages yet',
              time: 'Just now',
              unreadCount: 0,
              isOnline: false,
              avatar: chatAvatar,
            };
            queryClient.setQueryData<ChatPreview[]>(['chats'], [newChat, ...chatsArray]);
          }
        }
      }
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    // Always refetch after error or success
    onSettled: () => {
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
