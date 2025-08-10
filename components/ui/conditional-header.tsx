'use client';

import { useHeaderStore } from '@/lib/stores';
import { Header } from './header';

interface ConditionalHeaderProps {
  className?: string | undefined;
  sidebarOpen?: boolean | undefined;
  onToggleSidebar?: (() => void) | undefined;
  notifications?: any[] | undefined;
  notificationCount?: number | undefined;
  notificationsEnabled?: boolean | undefined;
  onToggleNotifications?: (() => void) | undefined;
  onLogoutClick?: (() => void) | undefined;
}

export function ConditionalHeader({
  className,
  sidebarOpen,
  onToggleSidebar,
  notifications,
  notificationCount,
  notificationsEnabled,
  onToggleNotifications,
  onLogoutClick
}: ConditionalHeaderProps) {
  const { isVisible } = useHeaderStore();

  if (!isVisible) {
    return null;
  }

  return (
    <Header
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
