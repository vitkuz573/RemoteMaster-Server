'use client';

import { use, useMemo } from 'react';
import { apiService } from '@/lib/api-service';

const dataCache = new Map<string, Promise<any>>();

function fetchCurrentUser(api: typeof apiService): Promise<{
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}> {
  const cacheKey = 'currentUser';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<{
      name: string;
      email: string;
      role: string;
      avatar: string | null;
    }>;
  }

  const promise = api.getCurrentUser().then(response => {
    if (response.success) {
      return response.user;
    } else {
      throw new Error('Failed to fetch current user');
    }
  }).catch(error => {
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

function fetchOrganizations(api: typeof apiService): Promise<Record<string, {
  name: string;
  organizationalUnits: Record<string, {
    name: string;
    hosts: Array<{
      id: string;
      name: string;
      status: string;
      type: string;
      ip?: string;
      ipAddress?: string;
      mac?: string;
      internetId?: string;
    }>;
  }>;
}>> {
  const cacheKey = 'organizations';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<Record<string, {
      name: string;
      organizationalUnits: Record<string, {
        name: string;
        hosts: Array<{
          id: string;
          name: string;
          status: string;
          type: string;
        }>;
      }>;
    }>>;
  }

  const promise = api.getOrganizationsWithUnits().then(response => {
    if (response.success) {
      return response.organizations;
    } else {
      throw new Error('Failed to fetch organizations');
    }
  }).catch(error => {
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

function fetchOrganizationsList(api: typeof apiService): Promise<Array<{
  id: string;
  tenantId?: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  plan: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt?: string;
  registeredAt?: string;
  idpConfig?: {
    provider: string;
    clientId: string;
    domain: string;
  };
  byoidConfig?: any;
}>> {
  const cacheKey = 'organizationsList';
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Promise<Array<{
      id: string;
      tenantId?: string;
      name: string;
      domain: string;
      industry?: string;
      size?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      plan: string;
      status: 'pending' | 'active' | 'suspended';
      createdAt?: string;
      registeredAt?: string;
      idpConfig?: {
        provider: string;
        clientId: string;
        domain: string;
      };
      byoidConfig?: any;
    }>>;
  }

  const promise = api.getOrganizations().then(response => {
    if (response.organizations) {
      return (response.organizations || []).map((org: any) => ({
        ...org,
        status: org.status as 'pending' | 'active' | 'suspended',
        createdAt: org.registeredAt || org.createdAt
      }));
    } else {
      throw new Error('Failed to fetch organizations list');
    }
  }).catch(error => {
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

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
    dataCache.delete(cacheKey);
    throw error;
  });

  dataCache.set(cacheKey, promise);
  return promise;
}

export function CurrentUserProvider({ children }: { children: (user: {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}) => React.ReactNode }) {
  const userPromise = useMemo(() => fetchCurrentUser(apiService), []);
  const user = use(userPromise);
  
  return <>{children(user)}</>;
}

export function OrganizationsProvider({ children }: { children: (organizations: Record<string, {
  name: string;
  organizationalUnits: Record<string, {
    name: string;
    hosts: Array<{
      id: string;
      name: string;
      status: string;
      type: string;
      ip?: string;
      ipAddress?: string;
      mac?: string;
      internetId?: string;
    }>;
  }>;
}>) => React.ReactNode }) {
  const organizationsPromise = useMemo(() => fetchOrganizations(apiService), []);
  const organizations = use(organizationsPromise);
  
  return <>{children(organizations)}</>;
}

export function OrganizationsListProvider({ children }: { children: (organizations: Array<{
  id: string;
  tenantId?: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  plan: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt?: string;
  registeredAt?: string;
  idpConfig?: {
    provider: string;
    clientId: string;
    domain: string;
  };
  byoidConfig?: any;
}>) => React.ReactNode }) {
  const organizationsPromise = useMemo(() => fetchOrganizationsList(apiService), []);
  const organizations = use(organizationsPromise);
  
  return <>{children(organizations)}</>;
}

export function IndustriesProvider({ children }: { children: (industries: string[]) => React.ReactNode }) {
  const industriesPromise = useMemo(() => fetchIndustries(apiService), []);
  const industries = use(industriesPromise);
  
  return <>{children(industries)}</>;
}

export function CompanySizesProvider({ children }: { children: (companySizes: string[]) => React.ReactNode }) {
  const companySizesPromise = useMemo(() => fetchCompanySizes(apiService), []);
  const companySizes = use(companySizesPromise);
  
  return <>{children(companySizes)}</>;
}

export function PricingPlansProvider({ children }: { children: (pricingPlans: any[]) => React.ReactNode }) {
  const pricingPlansPromise = useMemo(() => fetchPricingPlans(apiService), []);
  const pricingPlans = use(pricingPlansPromise);
  
  return <>{children(pricingPlans)}</>;
}

export function HomePageDataProvider({ children }: { children: (data: {
  currentUser: {
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
  organizations: Record<string, {
    name: string;
    organizationalUnits: Record<string, {
      name: string;
      hosts: Array<{
        id: string;
        name: string;
        status: string;
        type: string;
        ip?: string;
        ipAddress?: string;
        mac?: string;
        internetId?: string;
      }>;
    }>;
  }>;
}) => React.ReactNode }) {
  const currentUserPromise = useMemo(() => fetchCurrentUser(apiService), []);
  const organizationsPromise = useMemo(() => fetchOrganizations(apiService), []);

  const currentUser = use(currentUserPromise);
  const organizations = use(organizationsPromise);

  return (
    <>
      {children({
        currentUser,
        organizations
      })}
    </>
  );
}

export function AdminPageDataProvider({ children }: { children: (data: {
  organizations: Array<{
    id: string;
    tenantId?: string;
    name: string;
    domain: string;
    industry?: string;
    size?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    plan: string;
    status: 'pending' | 'active' | 'suspended';
    createdAt?: string;
    registeredAt?: string;
    idpConfig?: {
      provider: string;
      clientId: string;
      domain: string;
    };
    byoidConfig?: any;
  }>;
}) => React.ReactNode }) {
  const organizationsPromise = useMemo(() => fetchOrganizationsList(apiService), []);
  const organizations = use(organizationsPromise);

  return (
    <>
      {children({
        organizations
      })}
    </>
  );
}

export { 
  SetupWizardDataProvider,
  IndustriesProvider as SetupWizardIndustriesProvider,
  CompanySizesProvider as SetupWizardCompanySizesProvider,
  PricingPlansProvider as SetupWizardPricingPlansProvider
} from './setup-wizard/data-providers';

export function CurrentUserLoading() {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
      <div className="space-y-1">
        <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
        <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
      </div>
    </div>
  );
}

export function OrganizationsLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrganizationsListLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
            <div className="h-6 bg-muted animate-pulse rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePageDataLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted animate-pulse rounded"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPageDataLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
            <div className="h-6 bg-muted animate-pulse rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 
