'use client';

import React, { useEffect } from 'react';
import { ConditionalHeader } from './conditional-header';
import { useHeaderStore } from '@/lib/stores';

interface EnhancedHeaderProps {
  className?: string;
  showNotifications?: boolean;
  showProfile?: boolean;
  showSidebarToggle?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  notifications?: any[];
  notificationCount?: number;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  onLogoutClick?: () => void;
}

export function EnhancedHeader({
  className,
  showNotifications = false,
  showProfile = false,
  showSidebarToggle = true,
  customTitle,
  customSubtitle,
  sidebarOpen,
  onToggleSidebar,
  notifications,
  notificationCount,
  notificationsEnabled,
  onToggleNotifications,
  onLogoutClick
}: EnhancedHeaderProps) {
  const { updateConfig } = useHeaderStore();

  // Update header configuration when props change
  useEffect(() => {
    updateConfig({
      showNotifications,
      showProfile,
      showSidebarToggle,
      customTitle,
      customSubtitle,
    });
  }, [showNotifications, showProfile, showSidebarToggle, customTitle, customSubtitle, updateConfig]);

  return (
    <ConditionalHeader
      className={className}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      notifications={notifications}
      notificationCount={notificationCount}
      notificationsEnabled={notificationsEnabled}
      onToggleNotifications={onToggleNotifications}
      onLogoutClick={onLogoutClick}
    />
  );
} 