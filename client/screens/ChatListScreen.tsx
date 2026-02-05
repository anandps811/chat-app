import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChats } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '../services/socket';
import { sanitizeSearchQuery } from '../utils/sanitization';

const ChatListScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: chats, isLoading } = useChats();
  
  // Get current chatId from URL to highlight active chat
  const getCurrentChatId = () => {
    const path = location.pathname;
    if (path.startsWith('/chats/') && path !== '/chats' && path !== '/chats/new') {
      const chatId = path.split('/chats/')[1];
      // Remove any query parameters or hash
      return chatId.split('?')[0].split('#')[0];
    }
    return null;
  };
  
  const currentChatId = getCurrentChatId();

  // Listen for chat updates and creation to refresh the list
  useEffect(() => {
    const unsubscribeChatUpdated = socketService.onChatUpdated(() => {
      // Invalidate chats query to refresh the list when a chat is updated
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    const unsubscribeChatCreated = socketService.onChatCreated(() => {
      // Invalidate chats query to refresh the list when a new chat is created
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    return () => {
      unsubscribeChatUpdated();
      unsubscribeChatCreated();
    };
  }, [queryClient]);

  // Ensure chats is always an array
  const chatsArray = Array.isArray(chats) ? chats : [];
  const filteredChats = chatsArray.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex h-full w-full flex-col bg-ivory overflow-hidden">
      {/* Mobile Navigation (Hidden on Desktop) */}
      <nav className="lg:hidden flex items-center pt-6 px-6 justify-between shrink-0">
        <div className="text-[10px] font-display uppercase tracking-[0.4em] opacity-60 text-charcoal">
          Collection No. 01
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/profile-setup')}
            className="text-charcoal flex size-10 items-center justify-center hover:opacity-70 transition-opacity"
            title="Settings"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
          <button 
            onClick={() => navigate('/chats/new')}
            className="text-charcoal flex size-10 items-center justify-center hover:opacity-70 transition-opacity"
            title="New Message"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>
      </nav>

      {/* Mobile Header (Hidden on Desktop) */}
      <header className="lg:hidden px-6 pt-10 pb-4 shrink-0">
        <h1 className="tracking-tight text-3xl font-bold leading-tight serif-italic text-charcoal">
          Messages
        </h1>
      </header>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col px-6 pt-6 pb-4 border-b border-charcoal/5 shrink-0">
        <div className="text-[10px] font-display uppercase tracking-[0.4em] opacity-60 text-charcoal mb-4">
          Collection No. 01
        </div>
        <div className="flex items-center justify-between">
          <h1 className="tracking-tight text-2xl font-bold leading-tight serif-italic text-charcoal">
            Messages
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/profile-setup')}
              className="text-charcoal flex size-10 items-center justify-center hover:opacity-70 transition-opacity"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            <button 
              onClick={() => navigate('/chats/new')}
              className="text-charcoal flex size-10 items-center justify-center hover:opacity-70 transition-opacity"
              title="New Message"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Message List Container */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 lg:px-4 min-h-0">
        {/* Search Bar */}
        <div className="mb-4 px-2">
          <div className="flex w-full items-center rounded-lg border border-charcoal/10 bg-white/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden h-10 lg:h-12">
            <div className="text-charcoal/40 flex items-center justify-center pl-3">
              <span className="material-symbols-outlined text-lg">search</span>
            </div>
            <input 
              className="flex-1 border-none bg-transparent text-charcoal focus:ring-0 placeholder:text-charcoal/30 px-3 text-sm font-sans outline-none" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => {
                const sanitized = sanitizeSearchQuery(e.target.value);
                setSearchQuery(sanitized);
              }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-charcoal/40 font-display text-xs uppercase tracking-widest">Loading...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-charcoal/40 font-display text-xs uppercase tracking-widest">No conversations yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredChats.map(chat => {
                // Compare chat IDs as strings to ensure proper matching
                const chatIdStr = String(chat.id);
                const currentChatIdStr = currentChatId ? String(currentChatId) : null;
                const isActive = currentChatIdStr === chatIdStr;
                
                return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/chats/${chat.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer active:scale-[0.98] transition-all ${
                    isActive
                      ? 'bg-charcoal/10 border-charcoal/20 hover:bg-charcoal/15 shadow-sm'
                      : 'border-charcoal/5 bg-white/50 hover:bg-white hover:border-charcoal/10'
                  }`}
                >
                  <div className="relative shrink-0">
                    {chat.avatar ? (
                      <div 
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 lg:h-12 lg:w-12 border border-charcoal/10"
                        style={{ backgroundImage: `url("${chat.avatar}")` }}
                      />
                    ) : (
                      <div className="bg-charcoal/5 flex items-center justify-center rounded-full h-10 w-10 lg:h-12 lg:w-12 border border-charcoal/10">
                        <span className="text-charcoal font-display font-bold text-sm lg:text-base">{chat.name.charAt(0)}</span>
                      </div>
                    )}
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 size-2.5 lg:size-3 rounded-full bg-[#0bda5b] border-2 border-ivory"></div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="serif-italic text-sm lg:text-base font-bold text-charcoal truncate">{chat.name}</p>
                      <p className="text-charcoal/40 text-[9px] lg:text-[10px] font-sans tracking-tight uppercase ml-2">
                        {chat.time}
                      </p>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-charcoal/60 text-xs font-sans line-clamp-1 leading-snug">{chat.lastMessage}</p>
                      {(chat.unreadCount ?? 0) > 0 && (
                        <div className="size-4 lg:size-5 rounded-full bg-charcoal flex items-center justify-center shrink-0">
                          <span className="text-[8px] lg:text-[9px] text-ivory font-bold">{chat.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListScreen;