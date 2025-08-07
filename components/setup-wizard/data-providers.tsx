'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api-service';

// Data provider component that uses a traditional useEffect for data fetching
export function SetupWizardDataProvider({ children }: { children: (data: {
  industries: string[];
  companySizes: string[];
  pricingPlans: any[];
}) => React.ReactNode }) {
  const [data, setData] = useState<{
    industries: string[];
    companySizes: string[];
    pricingPlans: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [industriesRes, companySizesRes, pricingPlansRes] = await Promise.all([
          apiService.getIndustries(),
          apiService.getCompanySizes(),
          apiService.getPricingPlans()
        ]);

        if (industriesRes.success && companySizesRes.success && pricingPlansRes.success) {
          setData({
            industries: industriesRes.industries,
            companySizes: companySizesRes.companySizes,
            pricingPlans: pricingPlansRes.plans
          });
        } else {
          throw new Error('Failed to fetch required setup data.');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  if (isLoading) {
    return <SetupWizardDataLoading />;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-500/20 bg-red-500/10 rounded-md">
        <p className="font-bold">Error loading data:</p>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  if (data) {
    return <>{children(data)}</>;
  }

  return null;
}

// Loading components for Suspense fallbacks
export function IndustriesLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    </div>
  );
}

export function CompanySizesLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    </div>
  );
}

export function PricingPlansLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SetupWizardDataLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 