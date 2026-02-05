import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChatListSidebar from '../screens/ChatListScreen';

// Layout component that keeps the sidebar mounted on desktop
const ChatLayout: React.FC = () => {
  const location = useLocation();
  const isNewMessage = location.pathname === '/chats/new';
  const isChatDetail = location.pathname.startsWith('/chats/') && location.pathname !== '/chats' && !isNewMessage;
  const isEmpty = location.pathname === '/chats';

  return (
    <div className="flex h-screen w-full bg-ivory overflow-hidden">
      {/* Desktop Layout: Split view with sidebar always visible */}
      <div className="hidden lg:flex h-full w-full">
        {/* Chat List Sidebar - Always visible and mounted on desktop */}
        <div className="flex flex-col w-96 xl:w-[420px] border-r border-charcoal/10 h-full overflow-hidden shrink-0">
          <ChatListSidebar />
        </div>
        
        {/* Right Panel - Renders child routes via Outlet */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {isEmpty ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-charcoal/60 font-sans text-lg">Select a conversation to start chatting</p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
      
      {/* Mobile Layout: Show either sidebar OR outlet content */}
      <div className="lg:hidden h-full w-full">
        {isEmpty ? (
          <ChatListSidebar />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
