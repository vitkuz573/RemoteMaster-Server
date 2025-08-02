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
    if (!this.showNotifications) return;
    
    switch (type) {
      case 'success':
        toast.success(message, {
          description: 'Mock API response',
          duration: 3000,
        });
        break;
      case 'error':
        toast.error(message, {
          description: 'Mock API error',
          duration: 5000,
        });
        break;
      case 'warning':
        toast.warning(message, {
          description: 'Mock API warning',
          duration: 4000,
        });
        break;
      case 'info':
        toast.info(message, {
          description: 'Mock API info',
          duration: 3000,
        });
        break;
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
}

// Export singleton instance
export const mockApiService = new MockApiService(); 