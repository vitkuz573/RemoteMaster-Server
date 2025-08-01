export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  maxUsers: number;
  maxOrganizationalUnits: number;
  maxHosts: number;
  popular: boolean;
  hasTrial: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for individuals and small teams',
    features: [
      'Up to 5 users',
      'Up to 2 organizational units',
      'Up to 10 hosts',
      'Basic features',
      'Community support',
      'Standard security'
    ],
    maxUsers: 5,
    maxOrganizationalUnits: 2,
    maxHosts: 10,
    popular: false,
    hasTrial: false
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 5,
    description: 'Great for growing businesses',
    features: [
      'Up to 25 users',
      'Up to 10 organizational units',
      'Up to 50 hosts',
      'Advanced features',
      'Email support',
      'Enhanced security',
      'API access',
      'Custom integrations'
    ],
    maxUsers: 25,
    maxOrganizationalUnits: 10,
    maxHosts: 50,
    popular: true,
    hasTrial: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 15,
    description: 'For established organizations',
    features: [
      'Up to 100 users',
      'Up to 50 organizational units',
      'Up to 200 hosts',
      'Premium features',
      'Priority support',
      'Advanced security',
      'Full API access',
      'Custom integrations',
      'Advanced analytics',
      'Role-based access'
    ],
    maxUsers: 100,
    maxOrganizationalUnits: 50,
    maxHosts: 200,
    popular: false,
    hasTrial: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25,
    description: 'For large enterprises',
    features: [
      'Unlimited users',
      'Unlimited organizational units',
      'Unlimited hosts',
      'All features',
      '24/7 dedicated support',
      'Enterprise security',
      'Full API access',
      'Custom integrations',
      'Advanced analytics',
      'Role-based access',
      'SSO integration',
      'Custom branding',
      'Dedicated account manager'
    ],
    maxUsers: -1, // Unlimited
    maxOrganizationalUnits: -1, // Unlimited
    maxHosts: -1, // Unlimited
    popular: false,
    hasTrial: true
  }
];

export function getPlanById(id: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === id);
}

export function getPlanByName(name: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.name.toLowerCase() === name.toLowerCase());
}

export function calculateMonthlyCost(planId: string, expectedUsers: number): number {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  
  if (plan.price === 0) return 0;
  
  // For unlimited plans, use the expected users
  if (plan.maxUsers === -1) {
    return plan.price * expectedUsers;
  }
  
  // For limited plans, cap at the maximum
  const actualUsers = Math.min(expectedUsers, plan.maxUsers);
  return plan.price * actualUsers;
} 