"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useHeaderStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';

export interface UseAuthOptions {
  redirectOnUnauthed?: boolean;
  redirectPath?: string;
  skipPaths?: string[]; // paths where no auth check or redirect should happen
  hydrateUser?: boolean; // fetch current user/org on first valid token
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectOnUnauthed = true,
    redirectPath = '/login',
    skipPaths = ['/setup', '/login'],
    hydrateUser = true,
  } = options;
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
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const redirectToLogin = useCallback(() => {
    router.replace(redirectPath);
  }, [router, redirectPath]);

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
      if (token && hydrateUser) {
        if (!user) {
          const controller = new AbortController();
          inFlight.current = controller;
          const { user: userData } = await apiService.getCurrentUser({ signal: controller.signal });
          const { organizations } = await apiService.getOrganizations({ id: userData.organizationId } as any);
          const organization = organizations?.[0];

          login(token, {
            ...userData,
            organizationDomain: organization?.domain || '',
            organizationName: organization?.name || '',
          });
          if (inFlight.current === controller) inFlight.current = null;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Auth check failed:', message);
      setError(message);
      logoutAction();
    } finally {
      setCheckingAuth(false);
    }
  }, [token, user, login, logoutAction, setCheckingAuth, hydrateUser]);

  // Check authentication on mount unless in skipPaths
  useEffect(() => {
    const shouldSkip = skipPaths.includes(pathname);
    if (!shouldSkip) {
      void checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, pathname, JSON.stringify(skipPaths)]);

  useEffect(() => {
    const shouldSkip = skipPaths.includes(pathname);
    if (!redirectOnUnauthed) return;
    if (!isCheckingAuth && !isAuthenticated && !shouldSkip) {
      redirectToLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isCheckingAuth, pathname, redirectOnUnauthed, JSON.stringify(skipPaths), redirectToLogin]);

  const state = useMemo(() => ({ isAuthenticated, isCheckingAuth, user, token }), [isAuthenticated, isCheckingAuth, user, token]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
    error,
  } as const;
}
