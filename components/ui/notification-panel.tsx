"use client";

import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationPanelProps {
  notifications: Notification[];
  enabled: boolean;
  count: number;
  onToggleEnabled: () => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function NotificationPanel({
  notifications,
  enabled,
  count,
  onToggleEnabled,
  trigger,
  className
}: NotificationPanelProps) {
  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="relative">
      {enabled ? <Bell /> : <BellOff />}
      {enabled && count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      )}
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onToggleEnabled}
              className="h-6 px-2 text-xs"
            >
              {enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {enabled ? (
              notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn("p-3 rounded-md border", getTypeStyles(notification.type))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Notifications are disabled
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 
