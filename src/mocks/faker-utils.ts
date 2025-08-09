import { faker } from '@faker-js/faker';

// Constants for consistent data generation
export const STATUS_WEIGHTS = {
  online: 0.7,
  offline: 0.15,
  maintenance: 0.1,
  error: 0.05
} as const;

export const ORGANIZATION_STATUS_WEIGHTS = {
  active: 0.8,
  inactive: 0.15,
  suspended: 0.05
} as const;

export const HOST_TYPES = ['web', 'database', 'application', 'development', 'staging', 'production'] as const;
export const OPERATING_SYSTEMS = ['Ubuntu 22.04', 'CentOS 8', 'Windows Server 2022', 'Debian 11', 'RHEL 9'] as const;
export const UNIT_TYPES = [
  'Production', 'Development', 'Staging', 'Testing', 'QA', 'UAT',
  'Marketing', 'Sales', 'Support', 'Engineering', 'Operations'
] as const;
export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Government', 'Non-profit', 'Other'
] as const;
export const ORGANIZATION_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
] as const;

// Helper functions for weighted random selection
const weightedRandom = <T extends string>(weights: Record<T, number>): T => {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    cumulative += weight as number;
    if (random <= cumulative) {
      return key as T;
    }
  }
  
  return Object.keys(weights)[0] as T;
};

export interface MockOrganization {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  industry?: string;
  size: string;
  contactName?: string;
  contactEmail?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  byoidConfig?: {
    status: 'active' | 'inactive' | 'pending';
    issuerUrl: string;
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
  type: typeof HOST_TYPES[number];
  ipAddress?: string;
  mac?: string;
  internetId: string;
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
    status: weightedRandom(ORGANIZATION_STATUS_WEIGHTS),
    plan: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
    registeredAt: faker.date.past({ years: 2 }).toISOString(),
    industry: faker.helpers.arrayElement(INDUSTRIES),
    size: faker.helpers.arrayElement(ORGANIZATION_SIZES),
    contactName: faker.person.fullName(),
    contactEmail: faker.internet.email({ firstName: 'admin', lastName: 'user', provider: domain }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country()
    },
    byoidConfig: {
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
      issuerUrl: `https://accounts.${faker.internet.domainName()}`
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
    avatar: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.7 }) || null,
    organizationId,
    lastLogin: faker.helpers.maybe(() => faker.date.recent({ days: 30 }).toISOString()),
    isActive: faker.datatype.boolean({ probability: 0.9 })
  };
};

// Generate realistic organizational unit data
export const generateMockOrganizationalUnit = (): MockOrganizationalUnit => {
  const unitName = faker.helpers.arrayElement(UNIT_TYPES);
  
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
  const hostType = faker.helpers.arrayElement(HOST_TYPES);
  
  return {
    id: faker.string.alphanumeric(8),
    name: `${hostType}-${faker.helpers.arrayElement(['server', 'node', 'instance'])}-${faker.number.int({ min: 1, max: 99 })}`,
    status: weightedRandom(STATUS_WEIGHTS),
    type: hostType,
    ipAddress: faker.internet.ipv4(),
    mac: faker.internet.mac(),
    internetId: `RM-${faker.string.alphanumeric(10)}`,
    os: faker.helpers.arrayElement(OPERATING_SYSTEMS),
    lastSeen: faker.date.recent({ days: 7 }).toISOString(),
    cpuUsage: faker.number.float({ min: 5, max: 95, fractionDigits: 1 }),
    memoryUsage: faker.number.float({ min: 10, max: 90, fractionDigits: 1 }),
    diskUsage: faker.number.float({ min: 20, max: 85, fractionDigits: 1 })
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
// This function ensures NO DUPLICATE NAMES by shuffling the available unit types
// and limiting the count to the number of available types (10 total)
export const generateMockOrganizationalUnits = (count: number = 3): MockOrganizationalUnit[] => {
  // Create a shuffled copy of UNIT_TYPES to ensure we get unique names
  const availableUnitTypes = [...UNIT_TYPES];
  const shuffledTypes = faker.helpers.shuffle(availableUnitTypes);
  
  // Limit count to available unit types to avoid duplicates
  // We have 10 unit types: Production, Development, Staging, Testing, QA, UAT, Marketing, Sales, Support, Engineering, Operations
  const actualCount = Math.min(count, shuffledTypes.length);
  
  const units: MockOrganizationalUnit[] = [];
  
  for (let i = 0; i < actualCount; i++) {
    units.push({
      id: faker.string.alphanumeric(8),
      name: shuffledTypes[i],
      description: faker.lorem.sentence(),
      hosts: Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => generateMockHost()),
      createdAt: faker.date.past({ years: 1 }).toISOString()
    });
  }
  
  return units;
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
