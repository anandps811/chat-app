import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '../services/socket';

const ChatListScreen: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: chats = [], isLoading, error } = useChats();

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

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex h-screen w-full flex-col lg:flex-row bg-ivory overflow-hidden transition-all duration-300">
      
      {/* Desktop Navigation Column (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col w-[320px] xl:w-[400px] border-r border-charcoal/5 h-full p-12 shrink-0">
        <div className="text-[10px] font-display uppercase tracking-[0.4em] opacity-60 text-charcoal mb-20">
          Collection No. 01
        </div>
        
        <div className="flex-1">
          <h1 className="tracking-tight text-5xl font-bold leading-tight serif-italic text-charcoal mb-4">
            Messages
          </h1>
          <div className="w-12 h-[1px] bg-charcoal/20 mb-8"></div>
          <p className="font-sans text-charcoal/60 text-sm font-light leading-relaxed tracking-wide max-w-[200px]">
            A sanctuary for meaningful conversation.
          </p>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => navigate('/chats/new')}
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 bg-charcoal text-ivory font-display text-sm font-medium tracking-widest uppercase transition-all hover:bg-black shadow-sm"
          >
            New Message
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col h-full overflow-hidden">
        
        {/* Mobile Navigation (Hidden on Desktop) */}
        <nav className="lg:hidden flex items-center pt-6 px-6 justify-between">
          <div className="text-[10px] font-display uppercase tracking-[0.4em] opacity-60 text-charcoal">
            Collection No. 01
          </div>
          <button 
            onClick={() => navigate('/chats/new')}
            className="text-charcoal flex size-10 items-center justify-center hover:opacity-70"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </nav>

        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden px-6 pt-10 pb-4">
          <h1 className="tracking-tight text-3xl font-bold leading-tight serif-italic text-charcoal">
            Messages
          </h1>
        </header>

        {/* Scrollable Message List Container */}
        <div className="flex flex-1 flex-col overflow-hidden px-6 md:px-12 lg:px-16 lg:py-16 max-w-5xl">
          
          {/* Search Bar - Preserved Style */}
          <div className="mb-8">
            <div className="flex w-full items-center rounded-lg border border-charcoal/10 bg-white/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden h-12 md:h-14">
              <div className="text-charcoal/40 flex items-center justify-center pl-4">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input 
                className="flex-1 border-none bg-transparent text-charcoal focus:ring-0 placeholder:text-charcoal/30 px-4 text-sm md:text-base font-sans outline-none" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List - Using the exact same card patterns */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-10 custom-scrollbar">
            {isLoading ? (
              <p className="text-charcoal/40 font-display text-xs uppercase tracking-widest">Loading...</p>
            ) : (
              <div className="flex flex-col gap-3 md:gap-4">
                {filteredChats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => navigate(`/chats/${chat.id}`)}
                    className="flex items-center gap-4 p-4 md:p-5 rounded-lg border border-charcoal/5 bg-white/50 hover:bg-white hover:border-charcoal/10 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <div className="relative shrink-0">
                      {chat.avatar ? (
                        <div 
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 md:h-14 md:w-14 border border-charcoal/10"
                          style={{ backgroundImage: `url("${chat.avatar}")` }}
                        />
                      ) : (
                        <div className="bg-charcoal/5 flex items-center justify-center rounded-full h-12 w-12 md:h-14 md:w-14 border border-charcoal/10">
                          <span className="text-charcoal font-display font-bold text-lg">{chat.name.charAt(0)}</span>
                        </div>
                      )}
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 size-3 rounded-full bg-[#0bda5b] border-2 border-ivory"></div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="serif-italic text-base md:text-lg font-bold text-charcoal truncate">{chat.name}</p>
                        <p className="text-charcoal/40 text-[10px] md:text-xs font-sans tracking-tight uppercase">
                          {chat.time}
                        </p>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-charcoal/60 text-xs md:text-sm font-sans line-clamp-1 leading-snug">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <div className="size-5 rounded-full bg-charcoal flex items-center justify-center shrink-0 scale-90">
                            <span className="text-[9px] text-ivory font-bold">{chat.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListScreen;
