'use client';

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useHeaderStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';

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
      }
      // Don't redirect to login automatically - let the calling component decide
    } catch (error) {
      console.error('Auth check failed:', error instanceof Error ? error.message : String(error));
      logoutAction();
      // Don't redirect to login automatically - let the calling component decide
    } finally {
      setCheckingAuth(false);
    }
  }, [token, user, login, logoutAction, setCheckingAuth]);

  // Check authentication on mount only if we're not on setup or login pages
  useEffect(() => {
    const isSetupPage = pathname === '/setup';
    const isLoginPage = pathname === '/login';
    
    // Don't check auth on setup page
    if (!isSetupPage) {
      checkAuth();
    }
  }, [checkAuth, pathname]);

  useEffect(() => {
    const isSetupPage = pathname === '/setup';
    const isLoginPage = pathname === '/login';

    if (!isCheckingAuth && !isAuthenticated && !isSetupPage && !isLoginPage) {
      redirectToLogin();
    }
  }, [isAuthenticated, isCheckingAuth, pathname, redirectToLogin]);

  return {
    isAuthenticated,
    isCheckingAuth,
    user,
    login,
    logout,
    checkAuth,
  };
} 