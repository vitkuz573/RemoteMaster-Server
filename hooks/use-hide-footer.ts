import { useEffect } from 'react';
import { useFooterStore } from '@/lib/stores';

/**
 * Hook to hide footer on mount and restore on unmount
 * Use this in pages where footer should be hidden
 */
export function useHideFooter() {
  const { hideFooter, showFooter } = useFooterStore();
  
  useEffect(() => {
    hideFooter();
    return () => showFooter();
  }, [hideFooter, showFooter]);
} 