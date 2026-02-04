import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import OTPScreen from './screens/OTPScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ChatListScreen from './screens/ChatListScreen';
import NewMessageScreen from './screens/NewMessageScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import { useAuth } from './contexts/AuthContext';
import socketService from './services/socket';
import apiService from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Component to handle socket connection on auth
const SocketConnector: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = apiService.getAccessToken();
      if (token) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated]);

  return null;
};

// Layout component for authenticated chat screens (desktop split view)
const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isNewMessage = location.pathname === '/chats/new';
  const isChatDetail = location.pathname.startsWith('/chats/') && location.pathname !== '/chats' && !isNewMessage;

  return (
    <div className="flex justify-center min-h-screen bg-ivory overflow-hidden">
      <div className="relative w-full h-screen bg-ivory shadow-2xl overflow-hidden transition-all duration-300">
        {/* Desktop Split View */}
        <div className="hidden lg:flex h-full w-full">
          {/* Chat List - Always visible on desktop */}
          <div className="flex flex-col w-full lg:w-96 xl:w-[420px] border-r border-charcoal/10">
            <ChatListScreen />
          </div>
          {/* Chat Detail or New Message or Empty State */}
          <div className="flex-1 flex flex-col min-w-0">
            {isNewMessage ? (
              <NewMessageScreen />
            ) : isChatDetail ? (
              children
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-charcoal/60 font-sans text-lg">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile/Tablet Single View */}
        <div className="lg:hidden h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketConnector />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <WelcomeScreen />
              </PublicRoute>
            } 
          />
          <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUpScreen /></PublicRoute>} />
          <Route path="/otp" element={<PublicRoute><OTPScreen /></PublicRoute>} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupScreen /></ProtectedRoute>} />

          {/* Protected Chat Routes */}
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatLayout>
                  <ChatListScreen />
                </ChatLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/new"
            element={
              <ProtectedRoute>
                <ChatLayout>
                  <NewMessageScreen />
                </ChatLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <ProtectedRoute>
                <ChatLayout>
                  <ChatDetailScreen />
                </ChatLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
