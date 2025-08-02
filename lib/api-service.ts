import { appConfig } from './app-config';

// API Service for external API calls
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.endpoints.api;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers: defaultHeaders,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
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
    }>('/organizations/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrganizations(params?: {
    domain?: string;
    id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.append('domain', params.domain);
    if (params?.id) searchParams.append('id', params.id);

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
    }>('/auth/login', {
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
    }>('/byoid-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBYOIDSetup(organizationId?: string) {
    const endpoint = organizationId 
      ? `/byoid-setup?organizationId=${organizationId}`
      : '/byoid-setup';
    
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
  async getHealth() {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
    }>('/health');
  }


}

// Export singleton instance
export const apiService = new ApiService(); 