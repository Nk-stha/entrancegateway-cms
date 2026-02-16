'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { setupTokenRefreshInterval } from '@/lib/api/tokenRefreshMiddleware';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return authService.isAuthenticated();
    }
    return false;
  });
  const [userId, setUserId] = useState<number | null>(() => {
    if (typeof window !== 'undefined' && authService.isAuthenticated()) {
      return authService.getUserId();
    }
    return null;
  });

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setUserId(authService.getUserId());
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    };

    checkAuth();
    setupTokenRefreshInterval();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setUserId(authService.getUserId());
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
