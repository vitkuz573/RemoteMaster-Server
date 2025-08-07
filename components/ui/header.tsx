'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationPanel } from '@/components/ui/notification-panel';
import { ThemeSwitcher } from './theme-switcher';
import { PanelLeftClose, PanelLeftOpen, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { appConfig } from '@/lib/app-config';
import { useHeaderStore } from '@/lib/stores';
import { useAppStore } from '@/lib/stores';
import { useAuth } from '@/hooks/auth/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  className?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  notifications?: any[];
  notificationCount?: number;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
  onLogoutClick?: () => void;
}

export function Header({ 
  className = '',
  sidebarOpen = false,
  onToggleSidebar,
  notifications = [],
  notificationCount = 0,
  notificationsEnabled = true,
  onToggleNotifications,
  onLogoutClick
}: HeaderProps) {
  const { config } = useHeaderStore();
  const appState = useAppStore();
  const authState = useAuth();

  // Use provided props or fall back to app state
  const finalSidebarOpen = sidebarOpen ?? appState.sidebarOpen;
  const finalOnToggleSidebar = onToggleSidebar ?? appState.toggleSidebarOpen;
  const finalNotifications = notifications;
  const finalNotificationCount = notificationCount ?? appState.notificationCount;
  const finalNotificationsEnabled = notificationsEnabled ?? appState.notificationsEnabled;
  const finalOnToggleNotifications = onToggleNotifications ?? (() => appState.setNotificationsEnabled(!appState.notificationsEnabled));
  const finalOnLogoutClick = onLogoutClick ?? (() => appState.setLogoutModalOpen(true));

  const handleLogout = () => {
    finalOnLogoutClick();
  };

  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {config.showSidebarToggle && onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={finalOnToggleSidebar}
              className="lg:hidden"
            >
              {finalSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{appConfig.shortName}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {config.customTitle || appConfig.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {config.customSubtitle || appConfig.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <ThemeSwitcher />
          {config.showNotifications && (
            <NotificationPanel
              notifications={finalNotifications}
              count={finalNotificationCount}
              enabled={finalNotificationsEnabled}
              onToggleEnabled={finalOnToggleNotifications}
            />
          )}
          
          {config.showProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-auto px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                  <Avatar className="h-6 w-6">
                    {authState.user?.avatar ? (
                      <AvatarImage src={authState.user.avatar} alt={authState.user.name ?? 'User'} />
                    ) : (
                      <AvatarFallback className="text-xs">{(authState.user?.name ?? 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col items-start leading-tight text-left ml-2">
                    <span className="text-sm font-medium">
                      {authState.user?.name ?? 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground max-w-[10rem] truncate">
                      {authState.user?.organizationName ?? authState.user?.organizationDomain ?? (typeof window !== 'undefined' ? localStorage.getItem('tenant') ?? 'Organization' : 'Organization')}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 