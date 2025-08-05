'use client';

import { useAppStore } from '@/lib/stores';

export function useAppState() {
  const {
    sidebarPosition,
    sidebarOpen,
    notificationsEnabled,
    notificationCount,
    logoutModalOpen,
    isAuthenticated,
    isCheckingAuth,
    setSidebarPosition,
    toggleSidebar,
    toggleSidebarOpen,
    setNotificationsEnabled,
    setNotificationCount,
    setLogoutModalOpen,
    setIsAuthenticated,
    setIsCheckingAuth,
  } = useAppStore();

  return {
    // State
    sidebarPosition,
    sidebarOpen,
    notificationsEnabled,
    notificationCount,
    logoutModalOpen,
    isAuthenticated,
    isCheckingAuth,
    
    // Actions
    setSidebarPosition,
    toggleSidebar,
    toggleSidebarOpen,
    setNotificationsEnabled,
    setNotificationCount,
    setLogoutModalOpen,
    setIsAuthenticated,
    setIsCheckingAuth,
  };
} 