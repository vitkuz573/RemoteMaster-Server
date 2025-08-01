'use client';

import React, { createContext, useContext, useState } from 'react';

interface FooterContextType {
  isFooterVisible: boolean;
  hideFooter: () => void;
  showFooter: () => void;
  footerConfig: {
    showSystemStatus: boolean;
    showBuildDate: boolean;
    showDevBadge: boolean;
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
    showSystemStatus: true,
    showBuildDate: true,
    showDevBadge: true,
  });

  const hideFooter = () => setIsFooterVisible(false);
  const showFooter = () => setIsFooterVisible(true);
  
  const updateFooterConfig = (config: Partial<FooterContextType['footerConfig']>) => {
    setFooterConfig(prev => ({ ...prev, ...config }));
  };

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