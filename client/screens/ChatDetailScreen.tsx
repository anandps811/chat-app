import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message, BackendMessage, BackendChat, MessagesQueryData, SocketMessageEvent, ChatPreview } from '../types';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { useMessages, useSendMessage, useMarkMessagesAsRead, useDeleteChat } from '../hooks';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import apiService from '../services/api';
import { validateMessage } from '../utils/validation';
import { sanitizeMessage } from '../utils/sanitization';

const ChatDetailScreen: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [contactName, setContactName] = useState('User');
  const [contactAvatar, setContactAvatar] = useState('');
  const [contactUserId, setContactUserId] = useState<string | null>(null);
  const [isContactOnline, setIsContactOnline] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useMessages({ chatId: chatId || '', userId: user?.id });
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  const deleteChatMutation = useDeleteChat();

  // Get chat info to find the other participant's userId
  // Use a different query key to avoid conflicting with useChats hook
  const { data: chatsData } = useQuery<{ chats: BackendChat[] }>({
    queryKey: ['chats', 'raw'],
    queryFn: async () => {
      const response = await apiService.getUserChats();
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        throw new Error('No data received');
      }
      return response.data;
    },
    enabled: !!chatId,
    // Use staleTime to prevent unnecessary refetches
    staleTime: 30000, // 30 seconds
  });

  // Find the contact userId, name, and avatar from the chat list
  useEffect(() => {
    if (chatsData?.chats && chatId) {
      const chat = chatsData.chats.find((c) => {
        const cId = c.chatId || c.id;
        return String(cId) === String(chatId);
      });
      if (chat) {
        // Set contact user ID
        if (chat.userId) {
          setContactUserId(chat.userId);
        }
        // Set contact name from chat (this is the other participant's name)
        if (chat.name) {
          setContactName(chat.name);
        }
        // Set contact avatar from chat (this is the other participant's picture)
        if (chat.profileImage) {
          setContactAvatar(chat.profileImage);
        }
        // Initialize online status from chat list (if available)
        if (chat.isOnline !== undefined) {
          setIsContactOnline(chat.isOnline);
        }
      }
    }
  }, [chatsData, chatId]);

  const messages = data?.messages || [];

  // Helper function to extract sender ID from various formats
  const extractSenderId = (senderId: BackendMessage['senderId']): string | null => {
    if (typeof senderId === 'string') {
      return senderId;
    }
    if (senderId && typeof senderId === 'object') {
      if ('_id' in senderId && senderId._id) {
        return String(senderId._id);
      }
      if ('toString' in senderId && typeof senderId.toString === 'function') {
        return senderId.toString();
      }
    }
    return null;
  };

  useEffect(() => {
    if (data && data.rawMessages && data.rawMessages.length > 0) {
      const otherMessage = data.rawMessages.find((m) => {
        const msgSenderId = extractSenderId(m.senderId);
        return msgSenderId !== user?.id;
      });
      if (otherMessage) {
        setContactName(otherMessage.senderName || 'User');
        setContactAvatar(otherMessage.senderPicture || '');
        // Extract contact userId from senderId (could be string or object)
        const extractedId = extractSenderId(otherMessage.senderId);
        if (extractedId) {
          setContactUserId(extractedId);
        }
      }
    } else if (data && data.messages && data.messages.length > 0) {
      // Fallback: try to get contact name from formatted messages
      const otherMessage = data.messages.find((m) => m.sender === 'them');
      if (otherMessage) {
        // Extract name from message if available, otherwise keep default
        setContactName('User');
      }
    }
  }, [data, user?.id]);

  useEffect(() => {
    if (!chatId) return;

    // Join chat room
    socketService.joinChat(chatId);

    // Set up message listener
    const unsubscribeMessage = socketService.onMessage((data: SocketMessageEvent) => {
      const message = data.message;
      if (message?.id && message?.senderId) {
        // Check if this message belongs to the current chat
        const messageChatId = message.chatId || chatId;
        if (messageChatId === chatId) {
          queryClient.setQueryData<MessagesQueryData>(['messages', chatId], (oldData) => {
            if (!oldData) return oldData;

            // Check if message already exists to prevent duplicates
            const messageExists = oldData.messages.some((msg) => msg.id === message.id) ||
              oldData.rawMessages.some((msg) => msg.id === message.id);

            if (messageExists) {
              // Message already exists, just return old data
              return oldData;
            }

            const senderIdStr = extractSenderId(message.senderId);
            const newMessage: Message = {
              id: message.id,
              text: message.content,
              sender: senderIdStr === user?.id ? 'me' : 'them',
              time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            // Remove any temp messages with the same content (replace temp with real)
            const filteredMessages = oldData.messages.filter((msg) => {
              // Keep temp messages that don't match this message
              if (msg.id.startsWith('temp-')) {
                return msg.text !== message.content;
              }
              return true;
            });

            return {
              ...oldData,
              messages: [...filteredMessages, newMessage],
              rawMessages: [...oldData.rawMessages, message],
            };
          });
        }
      }
    });

    // Listen for chat updates (when chat is created or updated)
    const unsubscribeChatUpdated = socketService.onChatUpdated(() => {
      // Refresh chat list when any chat is updated (both formatted and raw)
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'raw'] });

      // Don't invalidate messages for current chat - socket already handles it
      // This prevents duplicate messages from refetch + socket event
    });

    // Listen for user online/offline status
    const unsubscribeUserOnline = socketService.onUserOnline((data) => {
      if (contactUserId && data.userId === contactUserId) {
        setIsContactOnline(true);
      }
    });

    const unsubscribeUserOffline = socketService.onUserOffline((data) => {
      if (contactUserId && data.userId === contactUserId) {
        setIsContactOnline(false);
      }
    });

    // Mark messages as read (only once when component mounts)
    markAsReadMutation.mutate(chatId);

    // Cleanup: leave chat and unsubscribe from messages
    return () => {
      unsubscribeMessage();
      unsubscribeChatUpdated();
      unsubscribeUserOnline();
      unsubscribeUserOffline();
      socketService.leaveChat(chatId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user?.id]); // Only depend on chatId and user.id to prevent duplicate listeners

  const handleSend = async () => {
    if (!inputText.trim() || !chatId) return;

    // Validate message
    const validation = validateMessage(inputText);
    if (!validation.isValid) {
      // Show error (could add a toast or error state here)
      console.warn(validation.error);
      return;
    }

    // Sanitize message content
    const textToSend = sanitizeMessage(inputText.trim());
    setInputText('');

    if (socketService.isConnected()) {
      // For socket connections, we still need manual optimistic update
      // since the mutation hook won't be called
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: textToSend,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      queryClient.setQueryData<MessagesQueryData>(['messages', chatId], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, messages: [...oldData.messages, tempMessage] };
      });

      // Optimistically update chat list
      queryClient.setQueryData<ChatPreview[]>(['chats'], (oldChats) => {
        if (!oldChats || !Array.isArray(oldChats)) return oldChats;
        const chatIndex = oldChats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          const updatedChats = [...oldChats];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: textToSend,
            time: 'Just now',
          };
          // Move chat to top
          const [movedChat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(movedChat);
          return updatedChats;
        }
        return oldChats;
      });

      // Listen for message sent confirmation (in case chat was created)
      let messageSentHandled = false;
      const unsubscribeMessageSent = socketService.onMessageSent((data) => {
        if (messageSentHandled) return; // Prevent duplicate handling
        messageSentHandled = true;

        if (data.wasNewChat && data.chatId !== chatId) {
          // Chat was just created with a new ID, navigate to it
          navigate(`/chats/${data.chatId}`, { replace: true });
        }
        unsubscribeMessageSent();
      });

      socketService.sendMessage(chatId, textToSend);

      // Cleanup listener after a timeout (in case event doesn't fire)
      setTimeout(() => {
        if (!messageSentHandled) {
          unsubscribeMessageSent();
        }
      }, 5000);
    } else {
      // For HTTP requests, use the mutation hook which handles optimistic updates
      sendMessageMutation.mutate({
        chatId,
        content: textToSend,
        userId: user?.id,
      });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (chatId) {
      deleteChatMutation.mutate(chatId, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          navigate('/chats');
        },
        onError: (error) => {
          console.error('Failed to delete chat:', error);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-ivory text-charcoal overflow-hidden font-sans">

      {/* Global Branding Header */}
      <header className="z-20 flex w-full flex-col border-b border-charcoal/5 bg-ivory/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-12 lg:px-20">
          {/* Left: Branding */}

<div className="flex items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => navigate('/chats')}
              className="flex items-center justify-center transition-opacity hover:opacity-50"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
            </button>

          </div>
          {/* Right: Profile Avatar */}
          <div className="flex justify-center text-center gap-5">
          <div className="flex items-center justify-end">
            <div className="size-10 lg:size-12 overflow-hidden rounded-full border border-charcoal/10 bg-white shadow-sm">
              {contactAvatar ? (
                <img src={contactAvatar} className="h-full w-full object-cover grayscale-[30%]" alt={contactName} />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold opacity-30">
                  {(contactName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          {/* Center: Contact Identity */}
          <div className="flex flex-col items-center text-center">
            <h1 className="serif-italic text-lg md:text-2xl lg:text-3xl font-bold leading-none">
              {contactName || 'User'}
            </h1>
            <div className="mt-1 flex items-center gap-1.5">
              <div className={`size-1.5 rounded-full ${isContactOnline ? 'bg-[#0bda5b]' : 'bg-charcoal/30'}`}></div>
              <p className="font-display text-[8px] md:text-[9px] uppercase tracking-widest opacity-60">
                {isContactOnline ? 'Active Now' : 'Offline'}
              </p>
            </div>
          </div>
          </div>
          </div>
          <button
            onClick={handleDeleteClick}
            disabled={deleteChatMutation.isPending}
            className="flex items-center justify-center text-left transition-opacity hover:opacity-50 text-red-500 disabled:opacity-30"
            title="Delete chat"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">delete</span>
          </button>

        </div>
      </header>

      {/* Message Thread */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-20 lg:px-32 xl:px-64 custom-scrollbar"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center opacity-20">
            <p className="font-display text-[10px] uppercase tracking-[0.3em]">Connecting...</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-5 py-3 md:px-7 md:py-4 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm transition-all ${msg.sender === 'me'
                        ? 'bg-charcoal text-ivory rounded-tr-none'
                        : 'bg-white/70 text-charcoal border border-charcoal/5 rounded-tl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-2 font-display text-[9px] uppercase tracking-wider text-charcoal/30">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Input Section - Floating Aesthetic */}
      <footer className="w-full px-6 py-8 md:px-20 lg:px-32 xl:px-64">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex flex-1 items-center rounded-full border border-charcoal/60 bg-white/40 px-6 backdrop-blur-sm transition-all focus-within:bg-white focus-within:shadow-md">
            <input
              type="text"
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
              placeholder="Message beautifully..."
              className="flex-1 bg-transparent py-4 text-sm md:text-base outline-none placeholder:text-charcoal/20 border-none focus:outline-none focus:ring-0"
            />
            <button
              disabled={!inputText.trim()}
              onClick={handleSend}
              className="ml-2 text-charcoal/40 transition-all hover:scale-110 hover:opacity-70 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-2xl font-light">send</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-ivory rounded-lg border border-charcoal/10 p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold serif-italic text-charcoal mb-2">Delete Chat</h2>
            <p className="text-charcoal/70 text-sm mb-6">
              Are you sure you want to delete this conversation with <strong>{contactName}</strong>? This action cannot be undone.
            </p>
            {deleteChatMutation.isError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-600 text-sm">
                  {deleteChatMutation.error instanceof Error
                    ? deleteChatMutation.error.message
                    : 'Failed to delete chat'}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={deleteChatMutation.isPending}
                className="px-4 py-2 rounded-lg border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors disabled:opacity-50 font-display"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteChatMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 font-display"
              >
                {deleteChatMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetailScreen;
