'use client';

import React, { createContext, useContext, useState } from 'react';

interface HeaderContextType {
  isVisible: boolean;
  showHeader: () => void;
  hideHeader: () => void;
  toggleHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  const showHeader = () => setIsVisible(true);
  const hideHeader = () => setIsVisible(false);
  const toggleHeader = () => setIsVisible(prev => !prev);

  return (
    <HeaderContext.Provider value={{ isVisible, showHeader, hideHeader, toggleHeader }}>
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