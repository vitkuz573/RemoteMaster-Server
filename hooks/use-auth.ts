'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: {
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  } | null;
}

export interface AuthActions {
  login: (token: string, userData: AuthState['user']) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
};

export function useAuth(): [AuthState, AuthActions] {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Create actions using useCallback directly
  const login = useCallback((token: string, userData: AuthState['user']) => {
    localStorage.setItem('authToken', token);
    setState({
      isAuthenticated: true,
      isCheckingAuth: false,
      user: userData,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setState({
      isAuthenticated: false,
      isCheckingAuth: false,
      user: null,
    });
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isCheckingAuth: true }));
      
      // Simulate authentication check
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        // In a real app, you would validate the token with your API
        // For now, we'll simulate a successful auth check
        setState({
          isAuthenticated: true,
          isCheckingAuth: false,
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            avatar: null,
          },
        });
      } else {
        setState({
          isAuthenticated: false,
          isCheckingAuth: false,
          user: null,
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState({
        isAuthenticated: false,
        isCheckingAuth: false,
        user: null,
      });
      router.push('/login');
    }
  }, [router]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return [state, { login, logout, checkAuth }];
} 