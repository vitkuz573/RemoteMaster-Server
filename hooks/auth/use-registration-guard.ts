import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/lib/stores';

interface UseRegistrationGuardProps {
  redirectTo?: string;
  enabled?: boolean;
}

export function useRegistrationGuard({
  redirectTo = '/register',
  enabled = true,
}: UseRegistrationGuardProps = {}) {
  const router = useRouter();
  const {
    registrationData,
    isLoading,
    isValidAccess,
  } = useRegistrationStore();

  useEffect(() => {
    if (enabled && !isLoading && !isValidAccess) {
      router.replace(redirectTo);
    }
  }, [enabled, isLoading, isValidAccess, router, redirectTo]);

  return {
    registrationData,
    isLoading,
    isValidAccess,
  };
}
