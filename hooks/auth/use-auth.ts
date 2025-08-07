'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useHeaderStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';
import { notifications } from '@/lib/utils/notifications';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
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

  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const logout = useCallback(() => {
    resetConfig();
    logoutAction();
    redirectToLogin();
  }, [logoutAction, resetConfig, redirectToLogin]);

  const checkAuth = useCallback(async () => {
    setCheckingAuth(true);
    try {
      if (!token) {
        // If no token, no need to proceed
        return;
      }
      // In a real app, you would validate the token with your API
      // This is simplified for the example
      if (!user) {
        // The following logic should be moved to a dedicated data fetching service or store
        // For now, we'll just show an error
        notifications.showError('User data is missing. Please log in again.');
        logoutAction();
      }
    } catch (error) {
      console.error('Auth check failed:', error instanceof Error ? error.message : String(error));
      logoutAction();
    } finally {
      setCheckingAuth(false);
    }
  }, [token, user, logoutAction, setCheckingAuth]);

  useEffect(() => {
    const isSetupPage = pathname === '/setup';
    
    // Run auth check on all pages except the setup page
    if (!isSetupPage) {
      checkAuth();
    }
  }, [checkAuth, pathname]);

  return {
    isAuthenticated,
    isCheckingAuth,
    user,
    login,
    logout,
    checkAuth,
  };
}
