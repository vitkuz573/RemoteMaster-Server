'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHeaderStore } from '@/lib/stores';

export function useAuth() {
  const router = useRouter();
  const { resetConfig } = useHeaderStore();
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
    // Clear header configuration on logout
    resetConfig();
    logoutAction();
    // Use replace to prevent back navigation to authenticated pages
    router.replace('/login');
  }, [logoutAction, router, resetConfig]);

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
            organizationId: '',
            organizationDomain: '',
            organizationName: '',
          });
        }
      } else {
        // Use replace to prevent back navigation to authenticated pages
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logoutAction();
      // Use replace to prevent back navigation to authenticated pages
      router.replace('/login');
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