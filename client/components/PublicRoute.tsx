import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Don't show loading screen on login/signup pages to allow error messages to display
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Only show loading screen if not on auth pages (to allow error messages to show)
  if (isLoading && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ivory">
        <p className="text-charcoal/60 font-sans">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chats" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
