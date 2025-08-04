'use client';

import { useState, useCallback, useMemo } from 'react';

// Types for application state
export interface AppState {
  sidebarPosition: 'left' | 'right';
  sidebarOpen: boolean;
  notificationsEnabled: boolean;
  notificationCount: number;
  logoutModalOpen: boolean;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
}

export interface AppActions {
  setSidebarPosition: (position: 'left' | 'right') => void;
  toggleSidebar: () => void;
  toggleSidebarOpen: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationCount: (count: number) => void;
  setLogoutModalOpen: (open: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsCheckingAuth: (checking: boolean) => void;
  handleLogout: () => void;
}

const initialState: AppState = {
  sidebarPosition: 'left',
  sidebarOpen: false,
  notificationsEnabled: true,
  notificationCount: 3,
  logoutModalOpen: false,
  isAuthenticated: false,
  isCheckingAuth: true,
};

export function useAppState(): [AppState, AppActions] {
  const [state, setState] = useState<AppState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('sidebarPosition');
      return {
        ...initialState,
        sidebarPosition: (savedPosition === 'left' || savedPosition === 'right') 
          ? savedPosition 
          : initialState.sidebarPosition,
      };
    }
    return initialState;
  });

  // Create actions using useCallback directly (not inside useMemo)
  const setSidebarPosition = useCallback((position: 'left' | 'right') => {
    setState(prev => ({ ...prev, sidebarPosition: position }));
    localStorage.setItem('sidebarPosition', position);
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      sidebarPosition: prev.sidebarPosition === 'left' ? 'right' : 'left' 
    }));
  }, []);

  const toggleSidebarOpen = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, notificationsEnabled: enabled }));
  }, []);

  const setNotificationCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, notificationCount: count }));
  }, []);

  const setLogoutModalOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, logoutModalOpen: open }));
  }, []);

  const setIsAuthenticated = useCallback((authenticated: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: authenticated }));
  }, []);

  const setIsCheckingAuth = useCallback((checking: boolean) => {
    setState(prev => ({ ...prev, isCheckingAuth: checking }));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setState(prev => ({ 
      ...prev, 
      isAuthenticated: false,
      logoutModalOpen: false 
    }));
  }, []);

  // Memoize the actions object to prevent unnecessary re-renders
  const actions = useMemo((): AppActions => ({
    setSidebarPosition,
    toggleSidebar,
    toggleSidebarOpen,
    setNotificationsEnabled,
    setNotificationCount,
    setLogoutModalOpen,
    setIsAuthenticated,
    setIsCheckingAuth,
    handleLogout,
  }), [
    setSidebarPosition,
    toggleSidebar,
    toggleSidebarOpen,
    setNotificationsEnabled,
    setNotificationCount,
    setLogoutModalOpen,
    setIsAuthenticated,
    setIsCheckingAuth,
    handleLogout,
  ]);

  return [state, actions];
} 