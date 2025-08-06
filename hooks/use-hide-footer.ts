import { useEffect } from 'react';
import { useFooterStore } from '@/lib/stores';

/**
 * Hook to conditionally hide the footer.
 * @param hidden - If true, the footer will be hidden. Defaults to true.
 */
export function useHideFooter(hidden: boolean = true) {
  const { hideFooter, showFooter } = useFooterStore();

  useEffect(() => {
    if (hidden) {
      hideFooter();
      return () => showFooter();
    }
  }, [hidden, hideFooter, showFooter]);
} 