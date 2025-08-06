'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHeaderStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';

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

  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const logout = useCallback(() => {
    // Clear header configuration on logout
    resetConfig();
    logoutAction();
    // Use replace to prevent back navigation to authenticated pages
    redirectToLogin();
  }, [logoutAction, resetConfig, redirectToLogin]);

  const checkAuth = useCallback(async () => {
    try {
      setCheckingAuth(true);
      if (token) {
        // In a real app, you would validate the token with your API
        if (!user) {
          const { user: userData } = await apiService.getCurrentUser();
          const { organizations } = await apiService.getOrganizations({ id: userData.organizationId });
          const organization = organizations?.[0];

          login(token, {
            ...userData,
            organizationDomain: organization?.domain || '',
            organizationName: organization?.name || '',
          });
        }
      } else {
        redirectToLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error instanceof Error ? error.message : String(error));
      logoutAction();
      redirectToLogin();
    } finally {
      setCheckingAuth(false);
    }
  }, [token, user, login, logoutAction, setCheckingAuth, redirectToLogin]);

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