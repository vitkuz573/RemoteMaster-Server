import { toast } from 'sonner';
import { MOCK_API_CONFIG, MockConfigHelpers } from './mock-api-config';

// Mock API Service for testing without real server
class MockApiService {
  private showNotifications: boolean;

  constructor(showNotifications: boolean = true) {
    this.showNotifications = showNotifications;
  }

  private delay(operation: keyof typeof MOCK_API_CONFIG.DELAYS = 'DEFAULT'): Promise<void> {
    const delayMs = MockConfigHelpers.getDelay(operation);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  private showMockNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if (this.showNotifications) {
      // This will be handled by the notification system
      console.log(`Mock ${type}: ${message}`);
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
    console.log('Mock API: registerOrganization called with:', data);
    
    // Simulate API delay
    await this.delay('REGISTRATION');
    
    // Generate temporary password
    const tempPassword = MockConfigHelpers.generateTempPassword();
    
    // Generate organization ID
    const orgId = MockConfigHelpers.generateId('org');
    const tenantId = MockConfigHelpers.generateId('tenant');
    
    // Simulate success response
    const mockResponse = {
      success: true,
      organization: {
        id: orgId,
        tenantId: tenantId,
        name: data.name,
        domain: data.domain,
        status: 'active',
        plan: data.selectedPlan,
        idpConfig: data.selectedPlan === 'free' ? {
          provider: 'built-in',
          type: 'internal',
          domain: data.domain
        } : undefined
      },
      credentials: {
        email: data.contactEmail,
        tempPassword: tempPassword,
        loginUrl: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://your-domain.com/login',
        organizationId: orgId
      },
      message: 'Organization registered successfully'
    };

    this.showMockNotification('success', 'Organization registered successfully! Check your email for login credentials.');
    
    // Simulate email notification
    setTimeout(() => {
      this.showMockNotification('info', `Temporary password sent to ${data.contactEmail}`);
    }, 2000);
    
    return mockResponse;
  }

  async getOrganizations(params?: {
    domain?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    console.log('Mock API: getOrganizations called with:', params);
    
    // Simulate API delay
    await this.delay('ORGANIZATIONS');
    
    // Use centralized mock data
    const mockOrganizations = MOCK_API_CONFIG.ORGANIZATIONS_LIST;

    return {
      success: true,
      organizations: mockOrganizations,
      total: mockOrganizations.length,
      message: 'Organizations retrieved successfully'
    };
  }

  async login(data: {
    email: string;
    password: string;
    domain: string;
  }) {
    console.log('Mock API: login called with:', data);
    
    // Simulate API delay
    await this.delay('LOGIN');
    
    // Use centralized mock credentials
    if (data.email === MOCK_API_CONFIG.CREDENTIALS.EMAIL && 
        data.password === MOCK_API_CONFIG.CREDENTIALS.PASSWORD) {
      const mockResponse = {
        success: true,
        token: MockConfigHelpers.generateId('token'),
        user: {
          id: 'user_1',
          email: data.email,
          name: 'Admin User',
          role: 'admin',
          organizationId: 'org_1'
        },
        message: 'Login successful'
      };

      this.showMockNotification('success', 'Login successful!');
      return mockResponse;
    } else {
      this.showMockNotification('error', 'Invalid credentials');
      throw new Error('Invalid credentials');
    }
  }

  async discoverOpenIDProvider(issuerUrl: string) {
    console.log('Mock API: discoverOpenIDProvider called with:', issuerUrl);
    
    // Simulate API delay
    await this.delay('BYOID');
    
    // Use centralized OpenID discovery settings
    const mockDiscovery = {
      success: true,
      discovery: {
        issuer: issuerUrl,
        authorization_endpoint: `${issuerUrl}/oauth/authorize`,
        token_endpoint: `${issuerUrl}/oauth/token`,
        userinfo_endpoint: `${issuerUrl}/oauth/userinfo`,
        jwks_uri: `${issuerUrl}/oauth/jwks`,
        response_types_supported: MOCK_API_CONFIG.OPENID_DISCOVERY.RESPONSE_TYPES,
        subject_types_supported: MOCK_API_CONFIG.OPENID_DISCOVERY.SUBJECT_TYPES,
        id_token_signing_alg_values_supported: MOCK_API_CONFIG.OPENID_DISCOVERY.SIGNING_ALGORITHMS,
        scopes_supported: MOCK_API_CONFIG.OPENID_DISCOVERY.SCOPES,
        claims_supported: MOCK_API_CONFIG.OPENID_DISCOVERY.CLAIMS,
        end_session_endpoint: `${issuerUrl}/oauth/logout`
      },
      message: 'OpenID Connect discovery completed successfully'
    };

    this.showMockNotification('success', 'OpenID Connect provider discovered successfully!');
    return mockDiscovery;
  }

  async submitBYOIDSetup(data: {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    organizationId: string;
    organizationName: string;
    organizationDomain: string;
  }) {
    console.log('Mock API: submitBYOIDSetup called with:', data);
    
    // Simulate API delay
    await this.delay('BYOID');
    
    // Simulate BYOID setup
    const mockResponse = {
      success: true,
      byoidConfig: {
        id: MockConfigHelpers.generateId('byoid'),
        organizationId: data.organizationId,
        issuerUrl: data.issuerUrl,
        clientId: data.clientId,
        clientSecret: '***',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      message: 'BYOID setup completed successfully'
    };

    this.showMockNotification('success', 'BYOID setup completed successfully!');
    return mockResponse;
  }

  async getBYOIDSetup(organizationId?: string) {
    console.log('Mock API: getBYOIDSetup called with:', organizationId);
    
    // Simulate API delay
    await this.delay('BYOID');
    
    // Use centralized BYOID config
    const mockConfig = {
      success: true,
      byoidConfig: {
        ...MOCK_API_CONFIG.BYOID_CONFIG,
        organizationId: organizationId || MOCK_API_CONFIG.BYOID_CONFIG.organizationId
      },
      message: 'BYOID configuration retrieved successfully'
    };

    return mockConfig;
  }

  async getHealth() {
    console.log('Mock API: getHealth called');
    
    // Simulate API delay
    await this.delay('HEALTH');
    
    // Use centralized health check settings
    const mockHealth = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: MOCK_API_CONFIG.HEALTH_CHECK.VERSION,
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      services: MOCK_API_CONFIG.HEALTH_CHECK.SERVICES,
      message: 'Service is healthy'
    };

    return mockHealth;
  }

  // Notification methods
  enableNotifications() {
    this.showNotifications = true;
    console.log('Mock API: Notifications enabled');
  }

  disableNotifications() {
    this.showNotifications = false;
    console.log('Mock API: Notifications disabled');
  }

  showSuccess(message: string) {
    this.showMockNotification('success', message);
  }

  showWarning(message: string) {
    this.showMockNotification('warning', message);
  }

  showInfo(message: string) {
    this.showMockNotification('info', message);
  }

  // Get current user information
  async getCurrentUser() {
    console.log('Mock API: getCurrentUser called');
    
    await this.delay('CURRENT_USER');
    
    return {
      success: true,
      user: MOCK_API_CONFIG.CURRENT_USER,
      message: 'Current user retrieved successfully'
    };
  }

  // Get organizations with hosts and units
  async getOrganizationsWithUnits() {
    console.log('Mock API: getOrganizationsWithUnits called');
    
    await this.delay('ORGANIZATIONS_WITH_UNITS');
    
    return {
      success: true,
      organizations: MOCK_API_CONFIG.ORGANIZATIONS_DATA,
      message: 'Organizations with units retrieved successfully'
    };
  }

  // Get pricing plans
  async getPricingPlans() {
    console.log('Mock API: getPricingPlans called');
    
    await this.delay('PRICING_PLANS');
    
    return {
      success: true,
      plans: MOCK_API_CONFIG.PRICING_PLANS,
      message: 'Pricing plans retrieved successfully'
    };
  }

  // Get industries
  async getIndustries() {
    console.log('Mock API: getIndustries called');
    
    await this.delay('INDUSTRIES');
    
    return {
      success: true,
      industries: MOCK_API_CONFIG.INDUSTRIES,
      message: 'Industries retrieved successfully'
    };
  }

  // Get company sizes
  async getCompanySizes() {
    console.log('Mock API: getCompanySizes called');
    
    await this.delay('COMPANY_SIZES');
    
    return {
      success: true,
      companySizes: MOCK_API_CONFIG.COMPANY_SIZES,
      message: 'Company sizes retrieved successfully'
    };
  }

  // Calculate monthly cost based on plan and users
  async calculateMonthlyCost(planId: string, expectedUsers: number) {
    console.log('Mock API: calculateMonthlyCost called with:', { planId, expectedUsers });
    
    await this.delay('COST_CALCULATION');
    
    const plan = MockConfigHelpers.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Use centralized cost calculation
    const userCost = MockConfigHelpers.calculateUserCost(planId, expectedUsers);
    const baseCost = plan.price;
    
    // For unlimited plans, use the expected users
    const userCount = plan.maxUsers === -1 ? expectedUsers : Math.min(expectedUsers, plan.maxUsers);
    
    // For limited plans, cap at the maximum
    const actualUsers = plan.maxUsers === -1 ? userCount : Math.min(userCount, plan.maxUsers);
    
    return {
      success: true,
      calculation: {
        planId,
        planName: plan.name,
        baseCost,
        userCost,
        totalCost: baseCost + userCost,
        expectedUsers,
        actualUsers,
        isUnlimited: plan.maxUsers === -1
      },
      message: 'Cost calculation completed successfully'
    };
  }
}

// Export singleton instance
export const mockApiService = new MockApiService(); 