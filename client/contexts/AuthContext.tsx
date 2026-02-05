import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { useLogin, useSignup, useLogout, useRefreshToken } from '../hooks/useAuth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, mobileNumber: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();

  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await refreshTokenMutation.mutateAsync();
      // Update the access token if refresh was successful
      if (response?.accessToken) {
        apiService.setAccessToken(response.accessToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Don't clear auth on refresh failure - the existing token might still be valid
      // Only clear if we get a specific error indicating the token is invalid
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Refresh token missing') || errorMessage.includes('Invalid refresh token')) {
        // Refresh token is invalid, but access token might still work
        // Don't clear auth immediately - let API calls handle it
      }
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = apiService.getAccessToken();
        
        if (storedUser && token) {
          // Set user immediately to prevent flash of login screen
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Try to refresh token in background (non-blocking)
            // This will update the access token if refresh succeeds
            // If it fails, we keep the existing token and user stays logged in
            refreshAuth().catch((error) => {
              console.warn('Background token refresh failed, keeping existing session:', error);
              // Don't clear auth - the existing token might still be valid
            });
          } catch (parseError) {
            // Invalid user data in localStorage
            console.error('Failed to parse user data:', parseError);
            localStorage.removeItem('user');
            apiService.setAccessToken(null);
          }
        } else {
          // No stored user or token, ensure clean state
          if (!storedUser && !token) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Only clear on critical errors
        setUser(null);
        localStorage.removeItem('user');
        apiService.setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await loginMutation.mutateAsync({ email: emailOrPhone, password });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsLoading(false); // Clear loading before returning success
      return { success: true };
    } catch (error) {
      setIsLoading(false); // Clear loading immediately on error
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signup = async (name: string, email: string, mobileNumber: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await signupMutation.mutateAsync({ name, email, mobileNumber, password });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      apiService.setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';

export { AuthProvider };

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };
