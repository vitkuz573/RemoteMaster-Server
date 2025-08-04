import { http, HttpResponse, delay } from 'msw'
import { 
  generateMockOrganizations, 
  generateMockUser, 
  generateMockOrganizationalUnits,
  generateMockPricingPlans,
  generateConsistentMockData,
  type MockOrganization,
  type MockUser
} from './faker-utils'

// Generate consistent mock data for the session
const mockData = generateConsistentMockData();
let mockOrganizations = mockData.organizations;
let mockUsers = mockData.users;
let mockUnits = mockData.units;

const mockPricingPlans = generateMockPricingPlans();

const mockIndustries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Government', 'Non-profit', 'Other'
]

const mockCompanySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
]

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
    console.log('🎯 MSW: Intercepted GET /health')
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
      organizations = organizations.filter(org => org.domain === domain)
    }
    
    if (id) {
      organizations = organizations.filter(org => org.id === id)
    }
    
    return HttpResponse.json({
      success: true,
      organizations,
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
      industry: data.industry,
      companySize: data.companySize,
      contactEmail: data.contactEmail,
      address: data.address
    }
    
    // Add to mock data
    mockOrganizations.push(newOrganization)
    
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

  // Authentication
  http.post('http://localhost:3001/auth/login', async ({ request }) => {
    await delay(300)
    const data = await request.json() as any
    
    // Check against mock credentials or find user in mock data
    if (data.email === 'admin@acme.com' && data.password === 'password123') {
      const mockUser = mockUsers.find(u => u.email === data.email) || generateMockUser('org_1');
      const mockOrg = mockOrganizations.find(o => o.id === mockUser.organizationId) || mockOrganizations[0];
      
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

  http.get('http://localhost:3001/user/current', async () => {
    await delay(100)
    
    // Get a random user from mock data or generate one
    const mockUser = mockUsers[0] || generateMockUser('org_1');
    
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
    console.log('🎯 MSW: Intercepted GET /pricing/plans')
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
    
    const plan = mockPricingPlans.find(p => p.id === planId)
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
    console.log('🎯 MSW: Intercepted GET /reference/industries')
    await delay(50)
    return HttpResponse.json({
      success: true,
      industries: mockIndustries,
      message: 'Industries retrieved successfully'
    })
  }),

  http.get('http://localhost:3001/reference/company-sizes', async () => {
    console.log('🎯 MSW: Intercepted GET /reference/company-sizes')
    await delay(50) 
    return HttpResponse.json({
      success: true,
      companySizes: mockCompanySizes,
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
    
    mockOrganizations.forEach(org => {
      const orgUnits = mockUnits.filter(unit => 
        unit.hosts.some(host => host.id.includes(org.id) || org.id.includes(host.id))
      );
      
      if (orgUnits.length === 0) {
        // Generate some units for this organization
        const generatedUnits = generateMockOrganizationalUnits(2);
        orgUnits.push(...generatedUnits);
      }
      
      const unitsMap: Record<string, any> = {};
      orgUnits.forEach(unit => {
        unitsMap[unit.name.toLowerCase()] = {
          id: unit.id,
          name: unit.name,
          description: unit.description,
          hosts: unit.hosts.map(host => ({
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