"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthStore, useHeaderStore, useAppStore, useHostSelectionStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';

export interface UseAuthOptions {
  redirectOnUnauthed?: boolean;
  redirectPath?: string;
  skipPaths?: string[]; // paths where no auth check or redirect should happen
  hydrateUser?: boolean; // fetch current user/org on first valid token
  requiredRoles?: string[]; // optional roles requirement
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectOnUnauthed = true,
    redirectPath = '/login',
    // Public routes that should never trigger auth redirects
    skipPaths = ['/setup', '/login', '/about'],
    hydrateUser = true,
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resetConfig } = useHeaderStore();
  const {
    isAuthenticated,
    isCheckingAuth,
    user,
    accessToken,
    refreshToken,
    expiresAt,
    login,
    logout: logoutAction,
    setCheckingAuth,
    setAccessToken,
  } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const redirectToLogin = useCallback(() => {
    const shouldSkip = skipPaths.includes(pathname);
    const currentSearch = searchParams?.toString?.() ?? '';
    const currentPath = pathname + (currentSearch ? `?${currentSearch}` : '');
    const returnTo = shouldSkip ? '' : encodeURIComponent(currentPath);
    const url = returnTo ? `${redirectPath}?returnTo=${returnTo}` : redirectPath;
    router.replace(url);
  }, [router, redirectPath, pathname, searchParams, skipPaths]);

  const logout = useCallback(() => {
    // Clear header configuration on logout
    resetConfig();
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('auth');
        ch.postMessage({ type: 'logout' });
        ch.close();
      }
    } catch {}
    // Cross-store UI cleanup
    try { useAppStore.getState().setLogoutModalOpen(false); } catch {}
    try {
      const s = useHostSelectionStore.getState();
      s.clearSelection();
      s.setSelectedOrganizationalUnit(null);
      s.setContainerRect(null);
    } catch {}
    logoutAction();
    // Use replace to prevent back navigation to authenticated pages
    redirectToLogin();
  }, [logoutAction, resetConfig, redirectToLogin]);

  const checkAuth = useCallback(async () => {
    try {
      setCheckingAuth(true);
      let token = accessToken;
      const isExpired = typeof expiresAt === 'number' && Date.now() >= expiresAt;
      if ((!token || isExpired) && refreshToken) {
        const refreshed = await apiService.refreshSession();
        if (refreshed) {
          token = useAuthStore.getState().accessToken;
        }
      }

      if (token && hydrateUser) {
        if (!user) {
          const controller = new AbortController();
          inFlight.current = controller;
          const { user: userData } = await apiService.getCurrentUser({ signal: controller.signal });
          const { organization } = await apiService.getOrganization(userData.organizationId);

          login({ accessToken: token, refreshToken, expiresIn: null }, {
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
  }, [accessToken, refreshToken, user, login, logoutAction, setCheckingAuth, hydrateUser]);

  // Check authentication on mount unless in skipPaths
  useEffect(() => {
    const shouldSkip = skipPaths.includes(pathname);
    if (!shouldSkip) {
      void checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, pathname, JSON.stringify(skipPaths)]);

  // Cross-tab auth sync via BroadcastChannel (logout)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('auth');
    const onMessage = (e: MessageEvent) => {
      if (e?.data?.type === 'logout') {
        logoutAction();
      }
    };
    ch.addEventListener('message', onMessage);
    return () => {
      try { ch.removeEventListener('message', onMessage); ch.close(); } catch {}
    };
  }, [logoutAction]);

  // Schedule proactive token refresh slightly before expiry
  useEffect(() => {
    if (!expiresAt) return;
    const now = Date.now();
    const lead = 30 * 1000; // 30s before expiry
    const delay = Math.max(0, expiresAt - now - lead);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      void apiService.refreshSession();
    }, delay);
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [expiresAt]);

  useEffect(() => {
    const shouldSkip = skipPaths.includes(pathname);
    if (!redirectOnUnauthed) return;
    // Role-based check once authenticated
    const lacksRole = options.requiredRoles && options.requiredRoles.length > 0
      ? !(user && options.requiredRoles.some((r) => user.role === r))
      : false;
    if (!isCheckingAuth && (!isAuthenticated || lacksRole) && !shouldSkip) {
      redirectToLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isCheckingAuth, pathname, redirectOnUnauthed, JSON.stringify(skipPaths), redirectToLogin, options.requiredRoles, user]);

  const state = useMemo(() => ({ isAuthenticated, isCheckingAuth, user, accessToken, refreshToken, expiresAt }), [isAuthenticated, isCheckingAuth, user, accessToken, refreshToken, expiresAt]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
    error,
  } as const;
}
