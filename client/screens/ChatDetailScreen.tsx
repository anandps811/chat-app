import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message } from '../types';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { useMessages, useSendMessage, useMarkMessagesAsRead } from '../hooks';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import apiService from '../services/api';

interface BackendMessage {
  id: string;
  chatId?: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderPicture?: string;
  createdAt: string;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useMessages({ chatId, userId: user?.id });
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  // Get chat info to find the other participant's userId
  const { data: chatsData } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiService.getUserChats();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!chatId,
  });

  // Find the contact userId from the chat list and initialize online status
  useEffect(() => {
    if (chatsData?.chats && chatId) {
      const chat = chatsData.chats.find((c: any) => c.chatId === chatId || c.id === chatId);
      if (chat?.userId) {
        setContactUserId(chat.userId);
        // Initialize online status from chat list (if available)
        if (chat.isOnline !== undefined) {
          setIsContactOnline(chat.isOnline);
        }
      }
    }
  }, [chatsData, chatId]);

  const messages = data?.messages || [];

  useEffect(() => {
    if (data?.rawMessages?.length > 0) {
      const otherMessage = data.rawMessages.find((m: BackendMessage) => {
        const msgSenderId = typeof m.senderId === 'string' ? m.senderId : (m.senderId as any)?._id?.toString() || (m.senderId as any)?.toString();
        return msgSenderId !== user?.id;
      });
      if (otherMessage) {
        setContactName(otherMessage.senderName || 'User');
        setContactAvatar(otherMessage.senderPicture || '');
        // Extract contact userId from senderId (could be string or object)
        const senderId = otherMessage.senderId;
        if (typeof senderId === 'string') {
          setContactUserId(senderId);
        } else if (senderId && typeof senderId === 'object') {
          const senderIdObj = senderId as any;
          if (senderIdObj._id) {
            setContactUserId(senderIdObj._id.toString());
          } else if (senderIdObj.toString) {
            setContactUserId(senderIdObj.toString());
          }
        }
      }
    } else if (data?.messages?.length > 0) {
      // Fallback: try to get contact name from formatted messages
      const otherMessage = data.messages.find((m: Message) => m.sender === 'them');
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
    const unsubscribeMessage = socketService.onMessage((data: { message: BackendMessage }) => {
      const message = data.message;
      if (message?.id && message?.senderId) {
        // Check if this message belongs to the current chat
        const messageChatId = message.chatId || chatId;
        if (messageChatId === chatId) {
          queryClient.setQueryData(['messages', chatId], (oldData: any) => {
            if (!oldData) return oldData;
            const newMessage: Message = {
              id: message.id,
              text: message.content,
              sender: message.senderId === user?.id ? 'me' : 'them',
              time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            return {
              ...oldData,
              messages: [...oldData.messages, newMessage],
              rawMessages: [...oldData.rawMessages, message],
            };
          });
        }
      }
    });

    // Listen for chat updates (when chat is created or updated)
    const unsubscribeChatUpdated = socketService.onChatUpdated((data: { chatId: string; lastMessage: string; timestamp: string }) => {
      // Refresh chat list when any chat is updated
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      // If this is the current chat, also update the messages query
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      }
    });

    // Listen for user online/offline status
    const unsubscribeUserOnline = socketService.onUserOnline((data: { userId: string }) => {
      if (contactUserId && data.userId === contactUserId) {
        setIsContactOnline(true);
      }
    });

    const unsubscribeUserOffline = socketService.onUserOffline((data: { userId: string }) => {
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
  }, [chatId, user?.id, queryClient, contactUserId]); // Added contactUserId to dependencies

  const handleSend = async () => {
    if (!inputText.trim() || !chatId) return;
    const textToSend = inputText.trim();
    setInputText('');

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: textToSend,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    queryClient.setQueryData(['messages', chatId], (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, messages: [...oldData.messages, tempMessage] };
    });

    if (socketService.isConnected()) {
      // Listen for message sent confirmation (in case chat was created)
      const unsubscribeMessageSent = socketService.onMessageSent((data: { messageId: string; chatId: string; wasNewChat?: boolean }) => {
        if (data.wasNewChat && data.chatId !== chatId) {
          // Chat was just created with a new ID, navigate to it
          navigate(`/chats/${data.chatId}`, { replace: true });
        }
        unsubscribeMessageSent();
      });

      socketService.sendMessage(chatId, textToSend);
      
      // Cleanup listener after a timeout (in case event doesn't fire)
      setTimeout(() => {
        unsubscribeMessageSent();
      }, 5000);
    } else {
      sendMessageMutation.mutate({ chatId, content: textToSend });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-ivory text-charcoal overflow-hidden font-sans">
      
      {/* Global Branding Header */}
      <header className="z-20 flex w-full flex-col border-b border-charcoal/5 bg-ivory/80 backdrop-blur-md">
        <div className="flex items-center gap-4 px-6 py-4 md:px-12 lg:px-20">
          {/* Left: Branding */}

          
          <div className="flex items-center gap-4 lg:gap-8">
            <button 
              onClick={() => navigate('/chats')}
              className="flex items-center justify-center transition-opacity hover:opacity-50"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back_ios</span>
            </button>
          </div>
   {/* Right: Profile Avatar */}
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
                    className={`px-5 py-3 md:px-7 md:py-4 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm transition-all ${
                      msg.sender === 'me' 
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
          <div className="flex flex-1 items-center rounded-full border border-charcoal/10 bg-white/40 px-6 backdrop-blur-sm transition-all focus-within:bg-white focus-within:shadow-md">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message beautifully..." 
              className="flex-1 bg-transparent py-4 text-sm md:text-base outline-none placeholder:text-charcoal/20"
            />
            <button 
              disabled={!inputText.trim()}
              onClick={handleSend}
              className="ml-2 text-charcoal transition-all hover:scale-110 hover:opacity-70 disabled:opacity-10"
            >
              <span className="material-symbols-outlined text-2xl font-light">send</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatDetailScreen;
