import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
