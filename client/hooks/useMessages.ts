import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { Message, MessagesQueryData, ChatPreview } from '../types';

interface UseMessagesParams {
  chatId: string;
  userId?: string;
  enabled?: boolean;
}

// Helper function to extract sender ID from various formats
const extractSenderId = (senderId: string | { _id: string; toString(): string } | { toString(): string }): string => {
  if (typeof senderId === 'string') {
    return senderId;
  }
  if (senderId && typeof senderId === 'object') {
    // Type guard for object with _id property
    const senderIdObj = senderId as { _id?: string; toString?: () => string };
    if ('_id' in senderIdObj && senderIdObj._id) {
      return String(senderIdObj._id);
    }
    if ('toString' in senderIdObj && typeof senderIdObj.toString === 'function') {
      return senderIdObj.toString();
    }
  }
  return String(senderId);
};

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
      const formattedMessages: Message[] = response.data.messages.map((msg) => {
        const senderIdStr = extractSenderId(msg.senderId);
        
        return {
          id: msg.id,
          text: msg.content,
          sender: senderIdStr === userId ? 'me' : 'them',
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
      return {
        messages: formattedMessages,
        rawMessages: response.data.messages,
      } as MessagesQueryData;
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
      userId?: string;
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
    // Optimistic update: add message immediately
    onMutate: async ({ chatId, content }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous values
      const previousMessages = queryClient.getQueryData<MessagesQueryData>(['messages', chatId]);
      const previousChats = queryClient.getQueryData<ChatPreview[]>(['chats']);

      // Optimistically update messages
      if (previousMessages) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          text: content,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        queryClient.setQueryData<MessagesQueryData>(['messages', chatId], {
          ...previousMessages,
          messages: [...previousMessages.messages, optimisticMessage],
        });
      }

      // Optimistically update chat list with new last message
      if (Array.isArray(previousChats)) {
        const chatIndex = previousChats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          const updatedChats = [...previousChats];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: content,
            time: 'Just now',
          };
          // Move chat to top
          const [movedChat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(movedChat);
          queryClient.setQueryData<ChatPreview[]>(['chats'], updatedChats);
        }
      }

      // Return context with snapshot for rollback
      return { previousMessages, previousChats };
    },
    // On error, rollback to previous state
    onError: (_err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
      }
      if (context?.previousChats) {
        queryClient.setQueryData(['chats'], context.previousChats);
      }
    },
    // On success, invalidate to refetch with server data
    onSuccess: (_, variables) => {
      // Invalidate messages for this chat to get the real message from server
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      // Invalidate chats to update last message timestamp
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
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
    // Optimistic update: clear unread count immediately
    onMutate: async (chatId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats'] });

      // Snapshot the previous value
      const previousChats = queryClient.getQueryData<ChatPreview[]>(['chats']);

      // Optimistically update unread count to 0
      if (previousChats) {
        const updatedChats = previousChats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              unreadCount: 0,
            };
          }
          return chat;
        });
        queryClient.setQueryData<ChatPreview[]>(['chats'], updatedChats);
      }

      // Return context for rollback
      return { previousChats };
    },
    // On error, rollback to previous state
    onError: (_err, _chatId, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(['chats'], context.previousChats);
      }
    },
    // On success, invalidate to refetch with server data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    // Always refetch after error or success
    onSettled: () => {
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
    // Optimistic update: toggle like immediately
    onMutate: async ({ chatId, messageId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<MessagesQueryData>(['messages', chatId]);

      // Optimistically update the message like status
      if (previousMessages) {
        const updatedRawMessages = previousMessages.rawMessages.map((msg) => {
          if (msg.id === messageId) {
            const currentIsLiked = msg.isLiked || false;
            const currentLikesCount = msg.likesCount || 0;
            return {
              ...msg,
              isLiked: !currentIsLiked,
              likesCount: currentIsLiked ? currentLikesCount - 1 : currentLikesCount + 1,
            };
          }
          return msg;
        });

        queryClient.setQueryData<MessagesQueryData>(['messages', chatId], {
          ...previousMessages,
          rawMessages: updatedRawMessages,
        });
      }

      // Return context for rollback
      return { previousMessages };
    },
    // On error, rollback to previous state
    onError: (_err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.chatId], context.previousMessages);
      }
    },
    // On success, invalidate to refetch with server data
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
    },
    // Always refetch after error or success
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
    },
  });
};
