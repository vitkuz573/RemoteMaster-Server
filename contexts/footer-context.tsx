'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FooterContextType {
  isFooterVisible: boolean;
  hideFooter: () => void;
  showFooter: () => void;
  footerConfig: {
      showBuildDate: boolean;
  };
  updateFooterConfig: (config: Partial<FooterContextType['footerConfig']>) => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

interface FooterProviderProps {
  children: React.ReactNode;
}

export function FooterProvider({ children }: FooterProviderProps) {
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [footerConfig, setFooterConfig] = useState({
    showBuildDate: true,
  });

  const hideFooter = useCallback(() => setIsFooterVisible(false), []);
  const showFooter = useCallback(() => setIsFooterVisible(true), []);
  
  const updateFooterConfig = useCallback((config: Partial<FooterContextType['footerConfig']>) => {
    setFooterConfig(prev => ({ ...prev, ...config }));
  }, []);

  return (
    <FooterContext.Provider 
      value={{
        isFooterVisible,
        hideFooter,
        showFooter,
        footerConfig,
        updateFooterConfig,
      }}
    >
      {children}
    </FooterContext.Provider>
  );
}

export function useFooter() {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
}

/**
 * Hook to hide footer on mount and restore on unmount
 * Use this in pages where footer should be hidden
 */
export function useHideFooter() {
  const { hideFooter, showFooter } = useFooter();
  
  React.useEffect(() => {
    hideFooter();
    return () => showFooter();
  }, [hideFooter, showFooter]);
}