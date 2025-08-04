import { http, HttpResponse, delay } from 'msw'

// Mock data
const mockOrganizations = [
  {
    id: 'org_1',
    tenantId: 'tenant_1', 
    name: 'Acme Corporation',
    domain: 'acme.com',
    status: 'active',
    plan: 'pro',
    registeredAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'org_2',
    tenantId: 'tenant_2',
    name: 'TechStart Inc', 
    domain: 'techstart.io',
    status: 'active',
    plan: 'free',
    registeredAt: '2024-01-20T14:45:00Z'
  }
]

const mockPricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for small teams getting started',
    price: 0,
    billingCycle: 'monthly',
    features: ['Up to 2 organizational units', 'Up to 10 hosts', 'Basic monitoring', 'Email support'],
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
    features: ['Up to 10 organizational units', 'Up to 50 hosts', 'Advanced monitoring', 'Priority support', 'Custom integrations'],
    maxOrganizationalUnits: 10,
    maxHosts: 50,
    maxUsers: 25
  },
  {
    id: 'enterprise',
    name: 'Enterprise', 
    description: 'For large-scale deployments',
    price: 299,
    billingCycle: 'monthly',
    features: ['Unlimited organizational units', 'Unlimited hosts', 'Enterprise-grade monitoring', 'Dedicated support', 'Advanced analytics', 'Custom branding', 'SLA guarantees'],
    maxOrganizationalUnits: -1,
    maxHosts: -1, 
    maxUsers: -1
  }
]

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
    
    return HttpResponse.json({
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
    
    if (data.email === 'admin@acme.com' && data.password === 'password123') {
      return HttpResponse.json({
        success: true,
        token: generateId('token'),
        user: {
          id: 'user_1',
          email: data.email,
          name: 'Admin User',
          role: 'admin',
          organization: {
            id: 'org_1',
            name: 'Acme Corporation', 
            domain: 'acme.com',
            tenantId: 'tenant_1'
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
    return HttpResponse.json({
      success: true,
      user: {
        id: 'user_1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'Administrator',
        avatar: null,
        organizationId: 'acme-corp'
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
    return HttpResponse.json({
      success: true,
      organizations: {
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
                { id: 'db-server-01', name: 'db-server-01', status: 'online', type: 'database' }
              ]
            },
            'development': {
              id: 'development', 
              name: 'Development',
              hosts: [
                { id: 'dev-server-01', name: 'dev-server-01', status: 'online', type: 'development' }
              ]
            }
          }
        }
      },
      message: 'Organizations with units retrieved successfully'
    })
  })
]