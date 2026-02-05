import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import OTPScreen from './screens/OTPScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import NewMessageScreen from './screens/NewMessageScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ChatLayout from './components/ChatLayout';
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

  // Listen for token refresh events and reconnect socket
  useEffect(() => {
    const unsubscribe = apiService.onTokenRefresh((newToken) => {
      if (newToken && isAuthenticated) {
        // Token was refreshed, reconnect socket with new token
        socketService.reconnectWithToken(newToken);
      } else if (!newToken) {
        // Token was cleared, disconnect socket
        socketService.disconnect();
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  return null;
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

          {/* Protected Chat Routes - Using Layout Pattern */}
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
          >
            {/* Empty route for /chats - shows empty state in layout */}
            <Route index element={<div />} />
            {/* Nested routes render in the right panel on desktop */}
            <Route path="new" element={<NewMessageScreen />} />
            <Route path=":chatId" element={<ChatDetailScreen />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
