'use client';

import { useHeaderStore } from '@/lib/stores';
import { Header } from './header';

interface ConditionalHeaderProps {
  className?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  notifications?: any[];
  notificationCount?: number;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  onLogoutClick?: () => void;
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