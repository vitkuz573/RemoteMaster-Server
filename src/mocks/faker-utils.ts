import { faker } from '@faker-js/faker';

export interface MockOrganization {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  industry?: string;
  companySize?: string;
  contactEmail?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar: string | null;
  organizationId: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface MockOrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  hosts: MockHost[];
  createdAt: string;
}

export interface MockHost {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  type: 'web' | 'database' | 'application' | 'development' | 'staging' | 'production';
  ipAddress?: string;
  os?: string;
  lastSeen?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}

export interface MockPricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxOrganizationalUnits: number;
  maxHosts: number;
  maxUsers: number;
  isPopular?: boolean;
}

// Generate realistic organization data
export const generateMockOrganization = (): MockOrganization => {
  const companyName = faker.company.name();
  const domain = faker.internet.domainName();
  
  return {
    id: faker.string.alphanumeric(8),
    tenantId: faker.string.alphanumeric(12),
    name: companyName,
    domain: domain,
    status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive', 'suspended']), // Bias towards active
    plan: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
    registeredAt: faker.date.past({ years: 2 }).toISOString(),
    industry: faker.helpers.arrayElement([
      'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
      'Retail', 'Consulting', 'Government', 'Non-profit', 'Other'
    ]),
    companySize: faker.helpers.arrayElement([
      '1-10 employees', '11-50 employees', '51-200 employees',
      '201-500 employees', '501-1000 employees', '1000+ employees'
    ]),
    contactEmail: faker.internet.email({ firstName: 'admin', lastName: 'user', provider: domain }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country()
    }
  };
};

// Generate realistic user data
export const generateMockUser = (organizationId: string): MockUser => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: faker.string.alphanumeric(8),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    role: faker.helpers.arrayElement(['admin', 'user', 'manager']),
    avatar: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.7 }),
    organizationId,
    lastLogin: faker.helpers.maybe(() => faker.date.recent({ days: 30 }).toISOString()),
    isActive: faker.datatype.boolean({ probability: 0.9 })
  };
};

// Generate realistic organizational unit data
export const generateMockOrganizationalUnit = (): MockOrganizationalUnit => {
  const unitTypes = [
    'Production', 'Development', 'Staging', 'Testing', 'QA', 'UAT',
    'Marketing', 'Sales', 'Support', 'Engineering', 'Operations'
  ];
  
  const unitName = faker.helpers.arrayElement(unitTypes);
  
  return {
    id: faker.string.alphanumeric(8),
    name: unitName,
    description: faker.lorem.sentence(),
    hosts: Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => generateMockHost()),
    createdAt: faker.date.past({ years: 1 }).toISOString()
  };
};

// Generate realistic host data
export const generateMockHost = (): MockHost => {
  const hostTypes = ['web', 'database', 'application', 'development', 'staging', 'production'];
  const hostType = faker.helpers.arrayElement(hostTypes);
  
  return {
    id: faker.string.alphanumeric(8),
    name: `${hostType}-${faker.helpers.arrayElement(['server', 'node', 'instance'])}-${faker.number.int({ min: 1, max: 99 })}`,
    status: faker.helpers.arrayElement(['online', 'online', 'online', 'offline', 'maintenance', 'error']), // Bias towards online
    type: hostType as any,
    ipAddress: faker.internet.ip(),
    os: faker.helpers.arrayElement(['Ubuntu 22.04', 'CentOS 8', 'Windows Server 2022', 'Debian 11', 'RHEL 9']),
    lastSeen: faker.date.recent({ days: 7 }).toISOString(),
    cpuUsage: faker.number.float({ min: 5, max: 95, precision: 0.1 }),
    memoryUsage: faker.number.float({ min: 10, max: 90, precision: 0.1 }),
    diskUsage: faker.number.float({ min: 20, max: 85, precision: 0.1 })
  };
};

// Generate pricing plans with realistic data
export const generateMockPricingPlans = (): MockPricingPlan[] => {
  return [
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
        'Email support',
        'Community forum access'
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
        'Custom integrations',
        'Advanced analytics',
        'API access'
      ],
      maxOrganizationalUnits: 10,
      maxHosts: 50,
      maxUsers: 25,
      isPopular: true
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
        'SLA guarantees',
        'On-premise deployment',
        'Custom integrations'
      ],
      maxOrganizationalUnits: -1,
      maxHosts: -1,
      maxUsers: -1
    }
  ];
};

// Generate multiple organizations with realistic data
export const generateMockOrganizations = (count: number = 5): MockOrganization[] => {
  return Array.from({ length: count }, () => generateMockOrganization());
};

// Generate users for an organization
export const generateMockUsers = (organizationId: string, count: number = 10): MockUser[] => {
  return Array.from({ length: count }, () => generateMockUser(organizationId));
};

// Generate organizational units for an organization
export const generateMockOrganizationalUnits = (count: number = 3): MockOrganizationalUnit[] => {
  return Array.from({ length: count }, () => generateMockOrganizationalUnit());
};

// Helper function to generate consistent data for testing
export const generateConsistentMockData = () => {
  const organizations = generateMockOrganizations(3);
  const users = organizations.flatMap(org => generateMockUsers(org.id, 5));
  const units = organizations.flatMap(org => generateMockOrganizationalUnits(3));
  
  return {
    organizations,
    users,
    units,
    pricingPlans: generateMockPricingPlans()
  };
}; 