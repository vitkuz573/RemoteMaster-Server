import { toast } from 'sonner';

// Mock API Service for testing without real server
class MockApiService {
  private showNotifications: boolean;

  constructor(showNotifications: boolean = true) {
    this.showNotifications = showNotifications;
  }

  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private showMockNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if (this.showNotifications) {
      // This will be handled by the notification system
      console.log(`Mock ${type}: ${message}`);
    }
  }

  // Mock data for organizations, hosts, and units
  private mockOrganizationsData = {
    'acme-corp': {
      id: 'acme-corp',
      name: 'Acme Corp',
      domain: 'acme.com',
      status: 'active',
      plan: 'pro',
      organizationalUnits: {
        'production': {
          id: 'production',
          name: 'Production',
          hosts: [
            { id: 'web-server-01', name: 'web-server-01', status: 'online', type: 'web' },
            { id: 'db-server-01', name: 'db-server-01', status: 'online', type: 'database' },
            { id: 'app-server-01', name: 'app-server-01', status: 'offline', type: 'application' }
          ]
        },
        'development': {
          id: 'development',
          name: 'Development',
          hosts: [
            { id: 'dev-server-01', name: 'dev-server-01', status: 'online', type: 'development' },
            { id: 'dev-server-02', name: 'dev-server-02', status: 'offline', type: 'development' }
          ]
        },
        'testing': {
          id: 'testing',
          name: 'Testing',
          hosts: [
            { id: 'test-server-01', name: 'test-server-01', status: 'online', type: 'testing' },
            { id: 'test-server-02', name: 'test-server-02', status: 'online', type: 'testing' },
            { id: 'test-server-03', name: 'test-server-03', status: 'offline', type: 'testing' }
          ]
        }
      }
    }
  };

  // Mock data for pricing plans
  private mockPricingPlans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for small teams getting started',
      price: 0,
      billingCycle: 'monthly',
      features: [
        'Up to 2 organizational units',
        'Up to 10 hosts',
        'Basic monitoring',
        'Email support'
      ],
      maxOrganizationalUnits: 2,
      maxHosts: 10,
      maxUsers: 5
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Ideal for growing businesses',
      price: 29,
      billingCycle: 'monthly',
      features: [
        'Up to 10 organizational units',
        'Up to 50 hosts',
        'Advanced monitoring',
        'Priority support',
        'Custom integrations'
      ],
      maxOrganizationalUnits: 10,
      maxHosts: 50,
      maxUsers: 25
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For established organizations',
      price: 99,
      billingCycle: 'monthly',
      features: [
        'Up to 50 organizational units',
        'Up to 200 hosts',
        'Enterprise monitoring',
        '24/7 support',
        'Advanced analytics',
        'Custom branding'
      ],
      maxOrganizationalUnits: 50,
      maxHosts: 200,
      maxUsers: 100
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large-scale deployments',
      price: 299,
      billingCycle: 'monthly',
      features: [
        'Unlimited organizational units',
        'Unlimited hosts',
        'Enterprise-grade monitoring',
        'Dedicated support',
        'Advanced analytics',
        'Custom branding',
        'SLA guarantees'
      ],
      maxOrganizationalUnits: -1, // Unlimited
      maxHosts: -1, // Unlimited
      maxUsers: -1 // Unlimited
    }
  ];

  // Mock data for industries
  private mockIndustries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Government',
    'Non-profit',
    'Other'
  ];

  // Mock data for company sizes
  private mockCompanySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  // Mock current user data
  private mockCurrentUser = {
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Administrator',
    avatar: null,
    organizationId: 'acme-corp'
  };

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
    await this.delay(1500);
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10).toUpperCase();
    
         // Generate organization ID
     const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
     const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
     
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
    await this.delay(800);
    
    // Simulate organizations data
    const mockOrganizations = [
      {
        id: 'org_1',
        tenantId: 'tenant_1',
        name: 'Acme Corporation',
        domain: 'acme.com',
        status: 'active',
        plan: 'pro',
        registeredAt: '2024-01-15T10:30:00Z',
        idpConfig: {
          provider: 'openid-connect',
          clientId: 'acme-client',
          clientSecret: '***',
          domain: 'acme.com'
        }
      },
      {
        id: 'org_2',
        tenantId: 'tenant_2',
        name: 'TechStart Inc',
        domain: 'techstart.io',
        status: 'active',
        plan: 'free',
        registeredAt: '2024-01-20T14:45:00Z',
        idpConfig: undefined
      },
      {
        id: 'org_3',
        tenantId: 'tenant_3',
        name: 'Global Solutions',
        domain: 'globalsolutions.com',
        status: 'pending',
        plan: 'enterprise',
        registeredAt: '2024-01-25T09:15:00Z',
        idpConfig: {
          provider: 'openid-connect',
          clientId: 'global-client',
          clientSecret: '***',
          domain: 'globalsolutions.com'
        }
      }
    ];

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
    await this.delay(1200);
    
    // Simulate authentication
    if (data.email === 'admin@acme.com' && data.password === 'password123') {
      const mockResponse = {
        success: true,
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
    await this.delay(1500);
    
    // Simulate discovery response
    const mockDiscovery = {
      success: true,
      discovery: {
        issuer: issuerUrl,
        authorization_endpoint: `${issuerUrl}/oauth/authorize`,
        token_endpoint: `${issuerUrl}/oauth/token`,
        userinfo_endpoint: `${issuerUrl}/oauth/userinfo`,
        jwks_uri: `${issuerUrl}/oauth/jwks`,
        response_types_supported: ['code', 'token', 'id_token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        claims_supported: ['sub', 'iss', 'name', 'email', 'picture'],
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
    await this.delay(2000);
    
    // Simulate BYOID setup
    const mockResponse = {
      success: true,
      byoidConfig: {
        id: `byoid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
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
    await this.delay(600);
    
    // Simulate BYOID config
    const mockConfig = {
      success: true,
      byoidConfig: {
        id: 'byoid_1',
        organizationId: organizationId || 'org_1',
        issuerUrl: 'https://accounts.google.com',
        clientId: 'mock-client-id',
        clientSecret: '***',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z'
      },
      message: 'BYOID configuration retrieved successfully'
    };

    return mockConfig;
  }

  async getHealth() {
    console.log('Mock API: getHealth called');
    
    // Simulate API delay
    await this.delay(300);
    
    // Simulate health check
    const mockHealth = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      services: {
        database: 'healthy',
        cache: 'healthy',
        external: 'healthy'
      },
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
    
    await this.delay(500);
    
    return {
      success: true,
      user: this.mockCurrentUser,
      message: 'Current user retrieved successfully'
    };
  }

  // Get organizations with hosts and units
  async getOrganizationsWithUnits() {
    console.log('Mock API: getOrganizationsWithUnits called');
    
    await this.delay(800);
    
    return {
      success: true,
      organizations: this.mockOrganizationsData,
      message: 'Organizations with units retrieved successfully'
    };
  }

  // Get pricing plans
  async getPricingPlans() {
    console.log('Mock API: getPricingPlans called');
    
    await this.delay(600);
    
    return {
      success: true,
      plans: this.mockPricingPlans,
      message: 'Pricing plans retrieved successfully'
    };
  }

  // Get industries
  async getIndustries() {
    console.log('Mock API: getIndustries called');
    
    await this.delay(300);
    
    return {
      success: true,
      industries: this.mockIndustries,
      message: 'Industries retrieved successfully'
    };
  }

  // Get company sizes
  async getCompanySizes() {
    console.log('Mock API: getCompanySizes called');
    
    await this.delay(300);
    
    return {
      success: true,
      companySizes: this.mockCompanySizes,
      message: 'Company sizes retrieved successfully'
    };
  }

  // Calculate monthly cost based on plan and users
  async calculateMonthlyCost(planId: string, expectedUsers: number) {
    console.log('Mock API: calculateMonthlyCost called with:', { planId, expectedUsers });
    
    await this.delay(200);
    
    const plan = this.mockPricingPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // For unlimited plans, use the expected users
    const userCount = plan.maxUsers === -1 ? expectedUsers : Math.min(expectedUsers, plan.maxUsers);
    
    // For limited plans, cap at the maximum
    const actualUsers = plan.maxUsers === -1 ? userCount : Math.min(userCount, plan.maxUsers);
    
    const baseCost = plan.price;
    const userCost = actualUsers * 2; // $2 per user
    
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