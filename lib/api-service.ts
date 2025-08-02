import { appConfig } from './app-config';
import { toast } from 'sonner';

// API Service for external API calls
class ApiService {
  private baseUrl: string;
  private showNotifications: boolean;

  constructor(showNotifications: boolean = true) {
    this.baseUrl = appConfig.endpoints.api;
    this.showNotifications = showNotifications;
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
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        
        if (this.showNotifications) {
          toast.error(errorMessage, {
            description: `Request to ${endpoint} failed`,
            duration: 5000,
          });
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (this.showNotifications && error instanceof Error) {
        toast.error(error.message, {
          description: `Network error: ${endpoint}`,
          duration: 5000,
        });
      }
      
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
  async getCurrentUser() {
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
    }>('/user/current');
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
          }>;
        }>;
      }>;
      message: string;
    }>('/organizations/with-units');
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
    }>('/pricing/plans');
  }

  // Get industries
  async getIndustries() {
    return this.request<{
      success: boolean;
      industries: string[];
      message: string;
    }>('/reference/industries');
  }

  // Get company sizes
  async getCompanySizes() {
    return this.request<{
      success: boolean;
      companySizes: string[];
      message: string;
    }>('/reference/company-sizes');
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
    }>('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify({ planId, expectedUsers }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 