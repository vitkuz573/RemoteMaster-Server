'use client';

import { useEffect } from 'react';
import { useApiStore } from '@/lib/stores';

export function StoreInitializer() {
  const { setMockApi } = useApiStore();

  useEffect(() => {
    // Initialize API store with mock API in development
    setMockApi(process.env.NODE_ENV === 'development');
  }, [setMockApi]);

  return null;
} 