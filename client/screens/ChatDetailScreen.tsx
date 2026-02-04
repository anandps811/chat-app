
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface Props {
  chatId: string;
  onBack: () => void;
}

const ChatDetailScreen: React.FC<Props> = ({ chatId, onBack }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock data for the demonstration
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hey! Are we still meeting for lunch today?', sender: 'them', time: '10:00 AM' },
    { id: '2', text: 'Absolutely. Thinking of that new Italian place?', sender: 'me', time: '10:05 AM' },
    { id: '3', text: 'Perfect! I heard they have incredible hand-made pasta.', sender: 'them', time: '10:06 AM' },
    { id: '4', text: "I'll be there by 12:30. See you soon!", sender: 'me', time: '10:10 AM' },
    { id: '5', text: 'Great, see you then!', sender: 'them', time: '10:12 AM' }
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const contactAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDyM_j40Sd5gvFDaX_z319P-A4gdNOahOp7Y7sh-7hpmQqz1HjCJrIbDwTXvs-gI3_KZC_AUj6qprzwugz7V_AbyaDY47a37Op389WTy1wq0g9sZn0Jz7XFmStnzWcJvhNb2nGaUBybLmPX_BEaoWbJ706w9h7AvkI3wnF-nIqOD7c7_DMtcXJ1RrDacQMO9nUm_-zLP4pVa22m_p__6iA0WpBDZpf2pEO-1qpgPtqvfW5avkEU7yzUe9hz7eRl1r19EqlEzeFwcbRy";

  return (
    <div className="relative flex h-full flex-col bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 sticky top-0 z-20 bg-background-dark/90 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={onBack}
          className="text-primary flex size-10 items-center justify-center -ml-2 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[30px]">chevron_left</span>
        </button>
        <div className="relative">
          <div 
            className="size-10 rounded-full bg-cover bg-center border border-slate-700" 
            style={{ backgroundImage: `url("${contactAvatar}")` }}
          />
          <div className="absolute bottom-0 right-0 size-3 rounded-full bg-[#0bda5b] border-2 border-background-dark"></div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="font-serif text-lg font-bold text-white leading-tight truncate">Amara Vance</h2>
          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Online</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">videocam</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`px-5 py-3.5 rounded-2xl shadow-sm text-base leading-relaxed ${
                  msg.sender === 'me' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-600 mt-1.5 font-medium px-1">
                {msg.time}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* Input Bar */}
      <footer className="p-4 pb-8 bg-background-dark/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <button className="text-primary flex size-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="flex-1 flex items-center bg-slate-800/50 rounded-2xl px-4 py-1.5 focus-within:bg-slate-800 transition-colors">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 font-serif text-lg py-2"
            />
            <button className="text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
          <button 
            disabled={!inputText.trim()}
            onClick={handleSend}
            className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatDetailScreen;
