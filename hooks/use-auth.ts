'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';

export function useAuth() {
  const router = useRouter();
  const {
    isAuthenticated,
    isCheckingAuth,
    user,
    token,
    login,
    logout: logoutAction,
    setCheckingAuth,
  } = useAuthStore();

  const logout = useCallback(() => {
    logoutAction();
    router.push('/login');
  }, [logoutAction, router]);

  const checkAuth = useCallback(async () => {
    try {
      setCheckingAuth(true);
      
      // Simulate authentication check
      if (token) {
        // In a real app, you would validate the token with your API
        if (!user) {
          login(token, {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            avatar: null,
          });
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logoutAction();
      router.push('/login');
    } finally {
      setCheckingAuth(false);
    }
  }, [token, user, login, logoutAction, router, setCheckingAuth]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isCheckingAuth,
    user,
    login,
    logout,
    checkAuth,
  };
} 