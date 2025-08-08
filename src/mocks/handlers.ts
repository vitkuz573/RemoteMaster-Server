import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import { 
  generateMockOrganizations, 
  generateMockUser, 
  generateMockUsers,
  generateMockOrganizationalUnits,
  generateMockPricingPlans,
  type MockOrganization,
  type MockUser,
  type MockOrganizationalUnit,
  INDUSTRIES,
  ORGANIZATION_SIZES
} from './faker-utils'

// Shared credential type used across handlers
type Credential = { password: string; role: 'admin' | 'user' }

// -----------------------------
// Mock DB initialization (runs once per dev session)
// -----------------------------
const globalAny = globalThis as any;

interface MockDatabase {
  organizations: MockOrganization[];
  users: MockUser[];
  units: MockOrganizationalUnit[];
  pricingPlans: ReturnType<typeof generateMockPricingPlans>;
  credentials: Record<string, Credential>;
}

function createMockDatabase(): MockDatabase {
  const organizations = generateMockOrganizations(3);
  const users = organizations.flatMap(org => generateMockUsers(org.id, 5));
  const units = organizations.flatMap(org => generateMockOrganizationalUnits(3));
  const pricingPlans = generateMockPricingPlans();

  const credentials: Record<string, Credential> = {};
  const DEFAULT_PASSWORD = 'password123';

  organizations.forEach(org => {
    const adminEmail = `admin@${org.domain}`;
    const userEmail = `user@${org.domain}`;

    credentials[adminEmail] = { password: DEFAULT_PASSWORD, role: 'admin' };
    credentials[userEmail] = { password: DEFAULT_PASSWORD, role: 'user' };

    // Deterministic users for login tests
    const adminUser = generateMockUser(org.id);
    adminUser.email = adminEmail;
    adminUser.role = 'admin';
    users.push(adminUser);

    const normalUser = generateMockUser(org.id);
    normalUser.email = userEmail;
    normalUser.role = 'user';
    users.push(normalUser);
  });

  return { organizations, users, units, pricingPlans, credentials };
}

if (!globalAny.__mswMockDB) {
  globalAny.__mswMockDB = createMockDatabase();
}

const {
  organizations: mockOrganizations,
  users: mockUsers,
  units: mockUnits,
  pricingPlans: mockPricingPlans,
  credentials: mockCredentials,
} = globalAny.__mswMockDB;


// ---------------------------------------------------------------------------
// Dev helper: log generated credentials (will appear in browser console once)
// ---------------------------------------------------------------------------
if (typeof console !== 'undefined' && Object.keys(mockCredentials).length) {
  // Delay a tick to avoid interleaving with other logs
  setTimeout(() => {
    console.groupCollapsed('[MSW] Generated dev credentials');
    // eslint-disable-next-line no-console
    console.table(
      Object.entries(mockCredentials).map(([email, credential]) => ({ 
        email, 
        password: (credential as Credential).password, 
        role: (credential as Credential).role 
      }))
    );
    console.groupEnd();
  }, 0);
}


// Helper functions
const generateId = (prefix: string = 'id') => 
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

const generateTempPassword = () =>
  Math.random().toString(36).substring(2, 10) + 
  Math.random().toString(36).substring(2, 10).toUpperCase()

// Request handlers
export const handlers = [
  // Health check
  http.get('http://localhost:3001/health', async () => {
    await delay(50)
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor(Math.random() * 86400),
      services: {
        database: 'healthy',
        cache: 'healthy', 
        external: 'healthy'
      }
    })
  }),

  // Organizations
  http.get('http://localhost:3001/organizations', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const domain = url.searchParams.get('domain')
    const id = url.searchParams.get('id')
    
    let organizations = mockOrganizations
    
    if (domain) {
      organizations = organizations.filter((org: MockOrganization) => 
        org.domain === domain || 
        org.id === domain ||
        org.domain.toLowerCase() === domain.toLowerCase() ||
        org.id.toLowerCase() === domain.toLowerCase()
      )
    }
    
    if (id) {
      organizations = organizations.filter((org: MockOrganization) => org.id === id)
    }

    return HttpResponse.json({
      success: true,
      organizations: organizations,
      total: organizations.length,
      message: 'Organizations retrieved successfully'
    })
  }),

  http.post('http://localhost:3001/organizations/register', async ({ request }) => {
    await delay(500)
    const data = await request.json() as any
    
    const orgId = generateId('org')
    const tenantId = generateId('tenant')
    const tempPassword = generateTempPassword()
    
    // Create a new organization with Faker.js data
    const newOrganization: MockOrganization = {
      id: orgId,
      tenantId: tenantId,
      name: data.name,
      domain: data.domain,
      status: 'active',
      plan: data.selectedPlan,
      registeredAt: new Date().toISOString(),
      industry: data.industry || faker.helpers.arrayElement(INDUSTRIES),
      size: data.size || faker.helpers.arrayElement(ORGANIZATION_SIZES),
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      address: data.address
    }
    
    // Add to mock data
    mockOrganizations.push(newOrganization)

    // Generate default credentials for the newly registered organization
    const adminEmail = `admin@${data.domain}`;
    const userEmail = `user@${data.domain}`;
    mockCredentials[adminEmail] = { password: tempPassword, role: 'admin' };
    mockCredentials[userEmail] = { password: 'password123', role: 'user' };

    // Create deterministic users linked to these credentials
    const adminUser = generateMockUser(orgId);
    adminUser.email = adminEmail;
    adminUser.role = 'admin';
    mockUsers.push(adminUser);

    const normalUser = generateMockUser(orgId);
    normalUser.email = userEmail;
    normalUser.role = 'user';
    mockUsers.push(normalUser);

    return HttpResponse.json({
      success: true,
      organization: {
        ...newOrganization,
        idpConfig: data.selectedPlan === 'free' ? {
          provider: 'built-in',
          type: 'internal', 
          domain: data.domain
        } : undefined
      },
      credentials: {
        email: data.contactEmail,
        tempPassword: tempPassword,
        loginUrl: 'https://your-domain.com/login',
        organizationId: orgId
      },
      message: 'Organization registered successfully'
    })
  }),

  // Enhanced Authentication
  http.post('http://localhost:3001/auth/login', async ({ request }) => {
    await delay(300)
    const data = await request.json() as any
    
    // Check against mock credentials
    const credentials = mockCredentials[data.email as keyof typeof mockCredentials];
    
    if (credentials && credentials.password === data.password) {
      // Find or generate user
      let mockUser = mockUsers.find((u: MockUser) => u.email === data.email);
      if (!mockUser) {
        mockUser = generateMockUser((mockOrganizations.find((o: MockOrganization) => o.domain === data?.domain)?.id) || mockOrganizations[0].id);
        mockUser.email = data.email;
        mockUser.role = credentials.role;
        mockUsers.push(mockUser);
      }
      
      const mockOrg = mockOrganizations.find((o: MockOrganization) => o.id === mockUser.organizationId) || mockOrganizations[0];
      
      if (!mockOrg) {
        return HttpResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        )
      }
      
      return HttpResponse.json({
        success: true,
        token: generateId('token'),
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          organization: {
            id: mockOrg.id,
            name: mockOrg.name, 
            domain: mockOrg.domain,
            tenantId: mockOrg.tenantId
          }
        },
        message: 'Login successful'
      })
    } else {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  }),

  // SSO Authentication
  http.post('http://localhost:3001/auth/sso', async ({ request }) => {
    await delay(500)
    const data = await request.json() as any
    
    // Simulate SSO authentication
    const mockUser = generateMockUser((mockOrganizations.find((o: MockOrganization) => o.domain === data?.domain)?.id) || mockOrganizations[0].id);
    const mockOrg = mockOrganizations.find((o: MockOrganization) => o.domain === data.domain) || mockOrganizations[0];
    
    if (!mockOrg) {
      return HttpResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      token: generateId('token'),
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: 'admin' as const,
        organization: {
          id: mockOrg.id,
          name: mockOrg.name,
          domain: mockOrg.domain,
          tenantId: mockOrg.tenantId
        }
      },
      message: 'SSO authentication successful'
    })
  }),

  http.get('http://localhost:3001/user/current', async () => {
    await delay(100)
    
    // Get a random user from mock data or generate one
    const mockUser = mockUsers[0] || generateMockUser(mockOrganizations[0].id);
    
    return HttpResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar,
        organizationId: mockUser.organizationId,
        lastLogin: mockUser.lastLogin,
        isActive: mockUser.isActive
      },
      message: 'Current user retrieved successfully'
    })
  }),

  // Pricing
  http.get('http://localhost:3001/pricing/plans', async () => {
    await delay(150)
    return HttpResponse.json({
      success: true,
      plans: mockPricingPlans,
      message: 'Pricing plans retrieved successfully'
    })
  }),

  http.post('http://localhost:3001/pricing/calculate', async ({ request }) => {
    await delay(50)
    const { planId, expectedUsers } = await request.json() as any
    
    const plan = mockPricingPlans.find((p: any) => p.id === planId)
    if (!plan) {
      return HttpResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }
    
    const userCost = plan.maxUsers === -1 ? expectedUsers * 2 : Math.min(expectedUsers, plan.maxUsers) * 2
    const baseCost = plan.price
    const actualUsers = plan.maxUsers === -1 ? expectedUsers : Math.min(expectedUsers, plan.maxUsers)
    
    return HttpResponse.json({
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
    })
  }),

  // Reference data
  http.get('http://localhost:3001/reference/industries', async () => {
    await delay(50)
    return HttpResponse.json({
      success: true,
      industries: INDUSTRIES,
      message: 'Industries retrieved successfully'
    })
  }),

  http.get('http://localhost:3001/reference/company-sizes', async () => {
    await delay(50) 
    return HttpResponse.json({
      success: true,
      companySizes: ORGANIZATION_SIZES,
      message: 'Company sizes retrieved successfully'
    })
  }),

  // BYOID setup
  http.post('http://localhost:3001/byoid-setup', async ({ request }) => {
    await delay(800)
    const data = await request.json() as any
    
    return HttpResponse.json({
      success: true,
      byoidConfig: {
        id: generateId('byoid'),
        organizationId: data.organizationId,
        issuerUrl: data.issuerUrl,
        clientId: data.clientId,
        clientSecret: '***',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      message: 'BYOID setup completed successfully'
    })
  }),

  http.get('http://localhost:3001/byoid-setup', async ({ request }) => {
    await delay(800)
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('organizationId')
    
    return HttpResponse.json({
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
    })
  }),

  // OpenID Connect discovery
  http.post('http://localhost:3001/auth/discover', async ({ request }) => {
    await delay(800)
    const { issuerUrl } = await request.json() as any
    
    return HttpResponse.json({
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
    })
  }),

  // Organizations with units
  http.get('http://localhost:3001/organizations/with-units', async () => {
    await delay(200)
    
    // Convert mock units to the expected format
    const organizationsWithUnits: Record<string, any> = {};
    
    mockOrganizations.forEach((org: MockOrganization) => {
      const orgUnits = mockUnits.filter((unit: MockOrganizationalUnit) => 
        unit.hosts.some((host: any) => host.id.includes(org.id) || org.id.includes(host.id))
      );
      
      if (orgUnits.length === 0) {
        // Generate some units for this organization
        const generatedUnits = generateMockOrganizationalUnits(2);
        orgUnits.push(...generatedUnits);
      } else {
        // Ensure no duplicate names in existing units
        const usedNames = new Set<string>();
        const uniqueUnits = orgUnits.filter((unit: MockOrganizationalUnit) => {
          if (usedNames.has(unit.name)) {
            return false; // Skip duplicates
          }
          usedNames.add(unit.name);
          return true;
        });
        orgUnits.length = 0; // Clear array
        orgUnits.push(...uniqueUnits);
      }
      
      const unitsMap: Record<string, any> = {};
      orgUnits.forEach((unit: MockOrganizationalUnit) => {
        unitsMap[unit.id] = {
          id: unit.id,
          name: unit.name,
          description: unit.description,
          hosts: unit.hosts.map((host: any) => ({
            id: host.id,
            name: host.name,
            status: host.status,
            type: host.type,
            ipAddress: host.ipAddress,
            os: host.os,
            lastSeen: host.lastSeen,
            cpuUsage: host.cpuUsage,
            memoryUsage: host.memoryUsage,
            diskUsage: host.diskUsage
          }))
        };
      });
      
      organizationsWithUnits[org.id] = {
        id: org.id,
        name: org.name,
        domain: org.domain,
        status: org.status,
        plan: org.plan,
        organizationalUnits: unitsMap
      };
    });
    
    return HttpResponse.json({
      success: true,
      organizations: organizationsWithUnits,
      message: 'Organizations with units retrieved successfully'
    })
  })
]