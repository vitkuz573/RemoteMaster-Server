import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/lib/stores';

interface OrganizationForm {
  name: string;
  domain: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  expectedUsers: number;
  selectedPlan: string;
  registrationTimestamp?: string;
  registrationId?: string;
  paymentCompleted?: boolean;
  paymentTimestamp?: string;
  paymentId?: string;
}

export function useRegistrationGuard(redirectTo: string = '/register') {
  const router = useRouter();
  const {
    registrationData,
    isLoading,
    isValidAccess,
    loadRegistrationData,
  } = useRegistrationStore();

  useEffect(() => {
    // Load registration data from store
    loadRegistrationData();
  }, [loadRegistrationData]);

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