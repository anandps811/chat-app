import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { Message } from '../types';

interface BackendMessage {
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
}

interface UseMessagesParams {
  chatId: string;
  userId?: string;
  enabled?: boolean;
}

export const useMessages = ({ chatId, userId, enabled = true }: UseMessagesParams) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const response = await apiService.getChatMessages(chatId);
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received');
      }
      const formattedMessages: Message[] = response.data.messages.map((msg: BackendMessage) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.senderId === userId ? 'me' : 'them',
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      return {
        messages: formattedMessages,
        rawMessages: response.data.messages as BackendMessage[],
      };
    },
    enabled: enabled && !!chatId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
      imageUrl,
      voiceMessageUrl,
      voiceMessageDuration,
    }: {
      chatId: string;
      content: string;
      imageUrl?: string;
      voiceMessageUrl?: string;
      voiceMessageDuration?: number;
    }) => {
      const response = await apiService.sendMessage(
        chatId,
        content,
        imageUrl,
        voiceMessageUrl,
        voiceMessageDuration
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      // Invalidate chats to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await apiService.markMessagesAsRead(chatId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, chatId) => {
      // Invalidate chats to update unread count
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

export const useToggleMessageLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, messageId }: { chatId: string; messageId: string }) => {
      const response = await apiService.toggleMessageLike(chatId, messageId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
    },
  });
};
