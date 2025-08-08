"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/lib/stores';

export interface RegistrationGuardOptions {
  redirectTo?: string;
  enabled?: boolean;
}

export function useRegistrationGuard(options: RegistrationGuardOptions | string = '/register') {
  const router = useRouter();
  const redirectTo = typeof options === 'string' ? options : options?.redirectTo ?? '/register';
  const enabled = typeof options === 'string' ? true : options?.enabled ?? true;
  const {
    registrationData,
    isLoading,
    isValidAccess,
  } = useRegistrationStore();

  useEffect(() => {
    if (!enabled) return;
    // Redirect if no valid registration data
    if (!isLoading && !isValidAccess) {
      router.replace(redirectTo);
    }
  }, [enabled, isLoading, isValidAccess, router, redirectTo]);

  return {
    registrationData,
    isLoading,
    isValidAccess,
  } as const;
} 
