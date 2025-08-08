'use client';

import React, { createContext, useContext, useState } from 'react';

interface HeaderConfig {
  showNotifications?: boolean;
  showProfile?: boolean;
  showSidebarToggle?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

interface HeaderContextType {
  isVisible: boolean;
  config: HeaderConfig;
  showHeader: () => void;
  hideHeader: () => void;
  toggleHeader: () => void;
  updateConfig: (newConfig: Partial<HeaderConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: HeaderConfig = {
  showNotifications: false,
  showProfile: false,
  showSidebarToggle: true,
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const [config, setConfig] = useState<HeaderConfig>(defaultConfig);

  const showHeader = React.useCallback(() => setIsVisible(true), []);
  const hideHeader = React.useCallback(() => setIsVisible(false), []);
  const toggleHeader = React.useCallback(() => setIsVisible(prev => !prev), []);
  
  const updateConfig = React.useCallback((newConfig: Partial<HeaderConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  const resetConfig = React.useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  return (
    <HeaderContext.Provider value={{ 
      isVisible, 
      config, 
      showHeader, 
      hideHeader, 
      toggleHeader, 
      updateConfig, 
      resetConfig 
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
} 