import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [registrationData, setRegistrationData] = useState<OrganizationForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidAccess, setIsValidAccess] = useState(false);

  useEffect(() => {
    // Check if user has valid registration data
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("organizationRegistration");
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setRegistrationData(data);
          setIsValidAccess(true);
        } catch (error) {
          console.error('Error parsing registration data:', error);
          setIsValidAccess(false);
        }
      } else {
        setIsValidAccess(false);
      }
    }
    setIsLoading(false);
  }, []);

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