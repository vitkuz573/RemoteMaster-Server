'use client';

import React from 'react';
import { useApiStore } from '@/lib/stores';
import { LoadingOverlay } from './loading-overlay';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutWrapper({ children, className }: LayoutWrapperProps) {
  const { isConnecting, isCheckingApi, pendingRequests } = useApiStore();
  const pathname = usePathname();
  
  // Show loading overlay when connecting, checking API, or when there are pending requests
  const isLoading = isConnecting || isCheckingApi || pendingRequests > 0;

  // Don't apply fixed header/footer spacing on main page since it has its own layout
  const isMainPage = pathname === '/';

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Loading overlay */}
      <LoadingOverlay 
        isLoading={isLoading} 
        text={isConnecting ? "Connecting to API..." : 
              isCheckingApi ? "Checking API availability..." : 
              "Loading data..."}
      />
      
      {/* Main content with proper spacing for fixed header and footer */}
      <div className={cn(
        "flex-1",
        !isMainPage && "pt-16 pb-24",
        isMainPage && "pb-24" // Only add bottom padding for footer on main page
      )}>
        {children}
      </div>
    </div>
  );
} 