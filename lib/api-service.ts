import { appConfig } from './app-config';
import { toast } from 'sonner';
import { useAuthStore } from './stores';
import { fetchJson, HttpError } from './http';

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
    
    return this.request<{
      organizations?: Array<{
        id: string;
        name: string;
        domain: string;
        status: string;
        plan: string;
        registeredAt: string;
        byoidConfig?: any;
      }>;
      organization?: any;
    }>(endpoint);
  }

  async getOrganization(id: string) {
    return this.request<{
      organization: any;
    }>(`/organizations/${id}`);
  }

  // Authentication operations
  async login(data: {
    email: string;
    password: string;
    domain: string;
  }) {
    return this.request<{
      success: boolean;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        organization: {
          id: string;
          name: string;
          domain: string;
          tenantId: string;
        };
      };
      token: string;
      message: string;
    }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    
    return this.request<{
      requests?: Array<{
        id: string;
        organizationName: string;
        organizationDomain: string;
        issuerUrl: string;
        status: string;
        submittedAt: string;
      }>;
      request?: any;
    }>(endpoint);
  }

  // Health check
  async getHealth(options?: RequestInit) {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
    }>('/health', options);
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
    return this.request<{
      success: boolean;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar: string | null;
        organizationId: string;
      };
      message: string;
    }>('/users/me', options);
  }

  // Get organizations with hosts and units
  async getOrganizationsWithUnits() {
    return this.request<{
      success: boolean;
      organizations: Record<string, {
        id: string;
        name: string;
        domain: string;
        status: string;
        plan: string;
        organizationalUnits: Record<string, {
          id: string;
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
      message: string;
    }>('/organizations?embed=units');
  }

  // Get pricing plans
  async getPricingPlans() {
    return this.request<{
      success: boolean;
      plans: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        billingCycle: string;
        features: string[];
        maxOrganizationalUnits: number;
        maxHosts: number;
        maxUsers: number;
      }>;
      message: string;
    }>('/plans');
  }

  // Dev helpers
  async getDevCredentials() {
    return this.request<{
      success: boolean;
      items: Array<{ email: string; password: string; role: 'admin' | 'user'; domain: string }>;
    }>('/dev/credentials');
  }

  // Get industries
  async getIndustries() {
    return this.request<{
      success: boolean;
      industries: string[];
      message: string;
    }>('/references/industries');
  }

  // Get company sizes
  async getCompanySizes() {
    return this.request<{
      success: boolean;
      companySizes: string[];
      message: string;
    }>('/references/company-sizes');
  }

  // Calculate monthly cost based on plan and users
  async calculateMonthlyCost(planId: string, expectedUsers: number) {
    return this.request<{
      success: boolean;
      calculation: {
        planId: string;
        planName: string;
        baseCost: number;
        userCost: number;
        totalCost: number;
        expectedUsers: number;
        actualUsers: number;
        isUnlimited: boolean;
      };
      message: string;
    }>('/quotes', {
      method: 'POST',
      body: JSON.stringify({ planId, expectedUsers }),
    });
  }

  // Discover OpenID Connect provider
  async discoverOpenIDProvider(issuerUrl: string) {
    return this.request<{
      success: boolean;
      discovery: {
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        userinfo_endpoint: string;
        jwks_uri: string;
        response_types_supported: string[];
        subject_types_supported: string[];
        id_token_signing_alg_values_supported: string[];
        scopes_supported: string[];
        claims_supported: string[];
        end_session_endpoint?: string;
      };
      message: string;
    }>('/oidc/discovery', {
      method: 'POST',
      body: JSON.stringify({ issuerUrl }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 
