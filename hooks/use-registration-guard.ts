import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/lib/stores';

export function useRegistrationGuard(redirectTo: string = '/register') {
  const router = useRouter();
  const {
    registrationData,
    isLoading,
    isValidAccess,
  } = useRegistrationStore();

  useEffect(() => {
    // Redirect if no valid registration data
    if (!isLoading && !isValidAccess) {
      // Use replace to prevent back navigation to protected pages
      router.replace(redirectTo);
    }
  }, [isLoading, isValidAccess, router, redirectTo]);

  return {
    registrationData,
    isLoading,
    isValidAccess
  };
} 