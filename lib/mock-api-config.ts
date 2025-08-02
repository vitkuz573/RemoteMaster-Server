// Mock API Configuration - Centralized configuration for all mock data and settings

export const MOCK_API_CONFIG = {
  // Enable/disable mock API (set to true to use mock API)
  ENABLED: true,
  
  // Delay settings for simulating network latency
  DELAYS: {
    DEFAULT: 1000,
    REGISTRATION: 1500,
    LOGIN: 1200,
    BYOID: 2000,
    HEALTH: 300,
    ORGANIZATIONS: 800,
    PRICING_PLANS: 600,
    INDUSTRIES: 300,
    COMPANY_SIZES: 300,
    COST_CALCULATION: 200,
    CURRENT_USER: 500,
    ORGANIZATIONS_WITH_UNITS: 800
  },
  
  // Mock credentials for testing
  CREDENTIALS: {
    EMAIL: 'admin@acme.com',
    PASSWORD: 'password123'
  },
  
  // Mock data for organizations, hosts, and units
  ORGANIZATIONS_DATA: {
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
  },
  
  // Mock organizations list
  ORGANIZATIONS_LIST: [
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
  ],
  
  // Mock pricing plans
  PRICING_PLANS: [
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
  ],
  
  // Mock industries
  INDUSTRIES: [
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
  ],
  
  // Mock company sizes
  COMPANY_SIZES: [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ],
  
  // Mock current user data
  CURRENT_USER: {
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Administrator',
    avatar: null,
    organizationId: 'acme-corp'
  },
  
  // Mock BYOID configuration
  BYOID_CONFIG: {
    id: 'byoid_1',
    organizationId: 'org_1',
    issuerUrl: 'https://accounts.google.com',
    clientId: 'mock-client-id',
    clientSecret: '***',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z'
  },
  
  // Cost calculation settings
  COST_CALCULATION: {
    USER_COST_PER_MONTH: 2, // $2 per user per month
    UNLIMITED_PLANS: ['enterprise']
  },
  
  // Health check settings
  HEALTH_CHECK: {
    VERSION: '1.0.0',
    SERVICES: {
      database: 'healthy',
      cache: 'healthy',
      external: 'healthy'
    }
  },
  
  // OpenID Connect discovery settings
  OPENID_DISCOVERY: {
    RESPONSE_TYPES: ['code', 'token', 'id_token'],
    SUBJECT_TYPES: ['public'],
    SIGNING_ALGORITHMS: ['RS256'],
    SCOPES: ['openid', 'profile', 'email'],
    CLAIMS: ['sub', 'iss', 'name', 'email', 'picture']
  }
};

// Helper functions for mock configuration
export const MockConfigHelpers = {
  // Get delay for specific operation
  getDelay(operation: keyof typeof MOCK_API_CONFIG.DELAYS): number {
    return MOCK_API_CONFIG.DELAYS[operation] || MOCK_API_CONFIG.DELAYS.DEFAULT;
  },
  
  // Generate random ID
  generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  },
  
  // Generate temporary password
  generateTempPassword(): string {
    return Math.random().toString(36).substring(2, 10) + 
           Math.random().toString(36).substring(2, 10).toUpperCase();
  },
  
  // Check if plan is unlimited
  isUnlimitedPlan(planId: string): boolean {
    return MOCK_API_CONFIG.COST_CALCULATION.UNLIMITED_PLANS.includes(planId);
  },
  
  // Get plan by ID
  getPlanById(planId: string) {
    return MOCK_API_CONFIG.PRICING_PLANS.find(plan => plan.id === planId);
  },
  
  // Calculate user cost
  calculateUserCost(planId: string, expectedUsers: number): number {
    const plan = this.getPlanById(planId);
    if (!plan) return 0;
    
    const userCount = plan.maxUsers === -1 ? expectedUsers : Math.min(expectedUsers, plan.maxUsers);
    return userCount * MOCK_API_CONFIG.COST_CALCULATION.USER_COST_PER_MONTH;
  }
};

// Export types for better type safety
export type MockApiConfig = typeof MOCK_API_CONFIG;
export type MockDelayConfig = typeof MOCK_API_CONFIG.DELAYS;
export type MockPricingPlan = typeof MOCK_API_CONFIG.PRICING_PLANS[0];
export type MockOrganization = typeof MOCK_API_CONFIG.ORGANIZATIONS_LIST[0]; 