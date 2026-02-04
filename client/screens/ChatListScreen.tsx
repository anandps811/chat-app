
import React from 'react';
import { ChatPreview } from '../types';

interface Props {
  onNewMessage: () => void;
  onChatClick: (id: string) => void;
}

const ChatListScreen: React.FC<Props> = ({ onNewMessage, onChatClick }) => {
  const chats: ChatPreview[] = [
    {
      id: '1',
      name: 'Amara Vance',
      lastMessage: 'Are we still on for coffee later?',
      time: '2m ago',
      unreadCount: 1,
      isOnline: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyM_j40Sd5gvFDaX_z319P-A4gdNOahOp7Y7sh-7hpmQqz1HjCJrIbDwTXvs-gI3_KZC_AUj6qprzwugz7V_AbyaDY47a37Op389WTy1wq0g9sZn0Jz7XFmStnzWcJvhNb2nGaUBybLmPX_BEaoWbJ706w9h7AvkI3wnF-nIqOD7c7_DMtcXJ1RrDacQMO9nUm_-zLP4pVa22m_p__6iA0WpBDZpf2pEO-1qpgPtqvfW5avkEU7yzUe9hz7eRl1r19EqlEzeFwcbRy'
    },
    {
      id: '2',
      name: 'Julian Thorne',
      lastMessage: 'The files are attached below.',
      time: '1h ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK5JCsfsM1A5U2GhvO42juDC6SLNICaQpeoCoOlCObm223hlx1BcbYWq2PoB_HQrYoK3mTJwKrdOY-ZBKMpGglAtK14Mrd5Vmc6ypK_Dia2xq2-wJU-u0d-_omJwwm2AkdP7ytWFpHjkyKAjA9sZ2A5U9Hho53uI_D8JKSe2APLd5_kMkPEuaA09sRDS-JqojxCuehjZRdwn0W8Dn7fmAb0FfnZKSjRKldTutpROri6xMGVCOJluZkAUUqozMeE9ggSmwaUNFyNgo'
    },
    {
      id: '3',
      name: 'Elena Rossi',
      lastMessage: "See you then! Can't wait.",
      time: 'Yesterday',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUS2jdgQBU19s15H3bbxvQHSfa6rYKC3pEnYtUE7MbPpWL96YsnZY98cyy_8t55SRqYsv0e3xoiQ4ukXYhxN6Zees2A9LrOv1t4CYn6zvfnmHTdsF62Bkn0tfVUmu3gBT6wKGSH37d9u6JPhlfnXNfUJ0StVDV4PmEKeNFp-UrtiZwxU0a3MaPZm913_ipo35ekZ1Os7alIa-4V6KBbIQPwAJnQLFEn83qz2Knj_jcbtc21d3RiOmzmAunlIa0OXy1GS3a3-RbC8gG'
    },
    {
      id: '4',
      name: 'Marcus Wright',
      lastMessage: 'Sent a photo',
      time: 'Tue',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWyJmVO9evMrSW2YC7mkDyBPfJF8jFBkMoh3cYtjZrwDyh-lmaAvrsGR9gUvmcCgyl7lJ8cQ6GRet3Xm7jxVdwqbjFR7n5m7yXSs5Y6WST6Pq6u6t6haEe-64H6kjacJwj6PEgNqRifu4LmTV6zVQiDB41w-E8TBbtfBvsJV3O2xgrjBXAJ2ccIthhVlFyVnFWwHicxO6QjAtJA8vmnj1uKduZ3nlFMZfWo5C1S-Af25jMKpGMeG7kp29KUkOMrvtLMjBxTcFMLkpu'
    },
    {
      id: '5',
      name: 'Sophia Chen',
      lastMessage: 'The meeting has been rescheduled to Friday at 10 AM.',
      time: 'Mon',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAuTSso4Vaz87moWZYjhBFxhtmY87hLLszsSTie4A-xF_bx8f6gk8ibxF5a9E7ZLl8N3a6YEqn1w_Slct_RQ4e-yoPdOqKkrR8VXUZg4p9lK5xlYyZMvdaomei5VfJx19tnp1CJxaOyOIzrJkhtMaYyofUxEScervZKNG3bseflv0fw2B2Xwe_pTSMem-0HeBdTr48anO9tQrFzLPli1VHFqgI4KzuY9U5zmk-nwbQmwQnMcDvclYOL34r9TBcYBGSi9Kc3SdUI6UB'
    }
  ];

  return (
    <div className="relative flex h-full flex-col bg-background-dark overflow-hidden">
      {/* Top Header */}
      <header className="flex flex-col gap-2 p-6 pb-2 sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-12">
          <div className="flex-1"></div>
          <button 
            onClick={onNewMessage}
            className="flex items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <h1 className="font-playfair text-[34px] font-bold tracking-tight text-white">Messages</h1>
      </header>

      {/* Search */}
      <div className="px-6 py-3">
        <div className="flex w-full items-stretch rounded-xl h-11 bg-slate-800/50 transition-colors">
          <div className="text-[#92adc9] flex items-center justify-center pl-4">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            className="flex-1 border-none bg-transparent text-white focus:ring-0 placeholder:text-[#92adc9] px-3 text-base font-normal outline-none" 
            placeholder="Search conversations..." 
          />
        </div>
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => onChatClick(chat.id)}
              className="flex items-center gap-4 px-6 min-h-[84px] py-3 justify-between hover:bg-slate-800/30 cursor-pointer active:scale-[0.98] transition-all border-b border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
                    style={{ backgroundImage: `url("${chat.avatar}")` }}
                  />
                  {chat.isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-[#0bda5b] border-2 border-background-dark"></div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-serif text-lg font-bold text-white leading-tight">{chat.name}</p>
                  <p className="text-[#92adc9] text-sm font-light leading-normal line-clamp-1">{chat.lastMessage}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <p className={`${chat.unreadCount ? 'text-primary' : 'text-[#92adc9]'} text-[11px] font-bold`}>
                  {chat.time}
                </p>
                {chat.unreadCount && (
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{chat.unreadCount}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-8 pb-4">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-[28px] fill-[1]">chat_bubble</span>
          <span className="text-[10px] font-bold tracking-wide uppercase">Chats</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#92adc9] hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[28px]">group</span>
          <span className="text-[10px] font-bold tracking-wide uppercase">Contacts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#92adc9] hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[28px]">settings</span>
          <span className="text-[10px] font-bold tracking-wide uppercase">Settings</span>
        </button>
      </nav>
      {/* Home Indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600/30 rounded-full"></div>
    </div>
  );
};

export default ChatListScreen;
