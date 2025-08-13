import { appConfig } from './app-config';
import { toast } from 'sonner';
import { useAuthStore } from './stores';
import { fetchJson, HttpError } from './http';
import {
  CurrentUserSchema,
  DevCredentialsSchema,
  LoginResponseSchema,
  OidcDiscoverySchema,
  OrganizationsResponseSchema,
  OrgsWithUnitsSchema,
  PricingPlansSchema,
  QuoteSchema,
} from '@/types/api-schemas'

const parseOrThrow = <T>(schema: { parse: (d: unknown) => T }, data: unknown, ctx: string): T => {
  try { return schema.parse(data) } catch (e) {
    const err = e as Error
    throw new Error(`Invalid response for ${ctx}: ${err.message}`)
  }
}

// API Service for external API calls
class ApiService {
  private baseUrl: string;
  private showNotifications: boolean;

  constructor(showNotifications: boolean = true) {
    this.baseUrl = appConfig.endpoints.api;
    this.showNotifications = showNotifications;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const withAuth = () => {
      try {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
        }
      } catch {}
    };

    try {
      withAuth();
      const doCall = async () =>
        await fetchJson<T>(url, {
          ...options,
          headers,
          timeoutMs: 10_000,
          retries: 1,
        });

      try {
        return await doCall();
      } catch (err) {
        if (err instanceof HttpError && err.status === 401) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // update header and retry once without counting as a retry in fetchJson
            const { accessToken: newToken } = useAuthStore.getState();
            if (newToken) (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            return await fetchJson<T>(url, { ...options, headers, timeoutMs: 10_000, retries: 0 });
          }
        }
        throw err;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      if (this.showNotifications) {
        toast.error(errorMessage, {
          description: `Request to ${endpoint} failed`,
          duration: 5000,
        });
      }
      throw error as Error;
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
      if (!refreshToken) return false;
      const res = await fetch(`${this.baseUrl}/tokens/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        logout();
        return false;
      }
      const data = await res.json();
      const newToken: string | undefined = data?.token;
      const expiresIn: number | undefined = data?.expiresIn;
      if (newToken) {
        setAccessToken(newToken, expiresIn ?? null);
        return true;
      }
      logout();
      return false;
    } catch {
      try { useAuthStore.getState().logout(); } catch {}
      return false;
    }
  }

  // Expose refresh for scheduling (no need to leak tokens)
  async refreshSession(): Promise<boolean> {
    return this.tryRefreshToken();
  }

  // Organization operations
  async registerOrganization(data: {
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
  }) {
    return this.request<{
      success: boolean;
      organization: {
        id: string;
        tenantId: string;
        name: string;
        domain: string;
        status: string;
        plan: string;
        idpConfig?: {
          provider: string;
          clientId: string;
          clientSecret: string;
          domain: string;
        };
      };
      message: string;
    }>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrganizations(params?: {
    domain?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.append('domain', params.domain);

    const endpoint = `/organizations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const raw = await this.request<any>(endpoint)
    return parseOrThrow(OrganizationsResponseSchema, raw, 'getOrganizations')
  }

  async getOrganization(id: string) {
    return this.request<{ organization: any }>(`/organizations/${id}`);
  }

  // Authentication operations
  async login(data: {
    email: string;
    password: string;
    domain: string;
  }) {
    const raw = await this.request<any>('/sessions', { method: 'POST', body: JSON.stringify(data) })
    return parseOrThrow(LoginResponseSchema, raw, 'login')
  }

  // BYOID (Bring Your Own Identity) operations
  async submitBYOIDSetup(data: {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    organizationId: string;
    organizationName: string;
    organizationDomain: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      requestId: string;
      estimatedReviewTime: string;
    }>(`/organizations/${data.organizationId}/idp-config`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBYOIDSetup(organizationId?: string) {
    if (!organizationId) {
      throw new Error('organizationId is required');
    }
    const endpoint = `/organizations/${organizationId}/idp-config`;
    
    return this.request<any>(endpoint)
  }

  // Health check
  async getHealth(options?: RequestInit) {
    return this.request<{ status: string; timestamp: string; version: string }>('/health', options);
  }

  // Notification management
  enableNotifications() {
    this.showNotifications = true;
  }

  disableNotifications() {
    this.showNotifications = false;
  }

  showSuccess(message: string) {
    if (this.showNotifications) {
      toast.success(message, {
        duration: 3000,
      });
    }
  }

  showWarning(message: string) {
    if (this.showNotifications) {
      toast.warning(message, {
        duration: 4000,
      });
    }
  }

  showInfo(message: string) {
    if (this.showNotifications) {
      toast.info(message, {
        duration: 3000,
      });
    }
  }

  // Get current user information
  async getCurrentUser(options?: RequestInit) {
    const raw = await this.request<any>('/users/me', options)
    return parseOrThrow(CurrentUserSchema, raw, 'getCurrentUser')
  }

  // Get organizations with hosts and units
  async getOrganizationsWithUnits() {
    const raw = await this.request<any>('/organizations?embed=units')
    return parseOrThrow(OrgsWithUnitsSchema, raw, 'getOrganizationsWithUnits')
  }

  // Get pricing plans
  async getPricingPlans() {
    const raw = await this.request<any>('/plans')
    return parseOrThrow(PricingPlansSchema, raw, 'getPricingPlans')
  }

  // Dev helpers
  async getDevCredentials() {
    const raw = await this.request<any>('/dev/credentials')
    return parseOrThrow(DevCredentialsSchema, raw, 'getDevCredentials')
  }

  // Get industries
  async getIndustries() {
    return this.request<{ success: boolean; industries: string[]; message: string }>('/references/industries')
  }

  // Get company sizes
  async getCompanySizes() {
    return this.request<{ success: boolean; companySizes: string[]; message: string }>('/references/company-sizes')
  }

  // Calculate monthly cost based on plan and users
  async calculateMonthlyCost(planId: string, expectedUsers: number) {
    const raw = await this.request<any>('/quotes', { method: 'POST', body: JSON.stringify({ planId, expectedUsers }) })
    return parseOrThrow(QuoteSchema, raw, 'calculateMonthlyCost')
  }

  // Discover OpenID Connect provider
  async discoverOpenIDProvider(issuerUrl: string) {
    const raw = await this.request<any>('/oidc/discovery', { method: 'POST', body: JSON.stringify({ issuerUrl }) })
    return parseOrThrow(OidcDiscoverySchema, raw, 'discoverOpenIDProvider')
  }
}

// Export singleton instance
export const apiService = new ApiService(); 
