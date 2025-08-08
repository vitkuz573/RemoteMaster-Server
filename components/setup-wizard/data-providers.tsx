'use client';

import { use, useMemo } from 'react';
import { apiService } from '@/lib/api-service';

// Global cache for data fetching - this ensures promises are created once and reused
const dataCache = new Map<string, Promise<any>>();

// Data fetching functions that return promises (not async functions)
function fetchIndustries(api: typeof apiService): Promise<string[]> {
  const cacheKey = 'industries';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<string[]>;
  }

  const promise = api.getIndustries().then(response => {
    if (response.success) {
      return response.industries;
    } else {
      throw new Error('Failed to fetch industries');
    }
  }).catch(error => {
    // Remove from cache on error so we can retry
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

function fetchCompanySizes(api: typeof apiService): Promise<string[]> {
  const cacheKey = 'companySizes';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<string[]>;
  }

  const promise = api.getCompanySizes().then(response => {
    if (response.success) {
      return response.companySizes;
    } else {
      throw new Error('Failed to fetch company sizes');
    }
  }).catch(error => {
    // Remove from cache on error so we can retry
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

function fetchPricingPlans(api: typeof apiService): Promise<any[]> {
  const cacheKey = 'pricingPlans';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<any[]>;
  }

  const promise = api.getPricingPlans().then(response => {
    if (response.success) {
      return response.plans;
    } else {
      throw new Error('Failed to fetch pricing plans');
    }
  }).catch(error => {
    // Remove from cache on error so we can retry
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

// Data provider components that use Suspense
export function IndustriesProvider({ children }: { children: (industries: string[]) => React.ReactNode }) {
  // Create the promise once and memoize it
  const industriesPromise = useMemo(() => fetchIndustries(apiService), []);
  const industries = use(industriesPromise);
  
  return <>{children(industries)}</>;
}

export function CompanySizesProvider({ children }: { children: (companySizes: string[]) => React.ReactNode }) {
  // Create the promise once and memoize it
  const companySizesPromise = useMemo(() => fetchCompanySizes(apiService), []);
  const companySizes = use(companySizesPromise);
  
  return <>{children(companySizes)}</>;
}

export function PricingPlansProvider({ children }: { children: (pricingPlans: any[]) => React.ReactNode }) {
  // Create the promise once and memoize it
  const pricingPlansPromise = useMemo(() => fetchPricingPlans(apiService), []);
  const pricingPlans = use(pricingPlansPromise);
  
  return <>{children(pricingPlans)}</>;
}

// Combined data provider for all setup wizard data
export function SetupWizardDataProvider({ children }: { children: (data: {
  industries: string[];
  companySizes: string[];
  pricingPlans: any[];
}) => React.ReactNode }) {
  // Create all promises once and memoize them - this ensures they're created only once
  const industriesPromise = useMemo(() => fetchIndustries(apiService), []);
  const companySizesPromise = useMemo(() => fetchCompanySizes(apiService), []);
  const pricingPlansPromise = useMemo(() => fetchPricingPlans(apiService), []);

  // Use all promises - React will handle the Suspense for each one
  const industries = use(industriesPromise);
  const companySizes = use(companySizesPromise);
  const pricingPlans = use(pricingPlansPromise);

  return (
    <>
      {children({
        industries,
        companySizes,
        pricingPlans
      })}
    </>
  );
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