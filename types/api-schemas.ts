import { z } from 'zod'

// Organization list schema (used in login/tenant detection)
export const OrganizationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  status: z.string().optional().default('active'),
  plan: z.string().optional().default(''),
  idpConfig: z
    .object({
      provider: z.string(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      domain: z.string().optional(),
    })
    .optional(),
  byoidConfig: z
    .object({
      issuerUrl: z.string().url(),
      status: z.enum(['pending', 'active', 'disabled']).optional().default('active'),
    })
    .optional(),
})

export const OrganizationsResponseSchema = z.object({
  organizations: z.array(OrganizationSummarySchema).default([]),
  organization: z.any().optional(),
})

// Login schema
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    organization: z.object({
      id: z.string(),
      name: z.string(),
      domain: z.string(),
      tenantId: z.string().optional().default(''),
    }),
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  message: z.string().optional().default(''),
})

// Current user schema
export const CurrentUserSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
    avatar: z.string().nullable(),
    organizationId: z.string(),
  }),
  message: z.string().optional().default(''),
})

// Organizations with units
export const HostSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  type: z.string(),
  ip: z.string().optional(),
  ipAddress: z.string().optional(),
  mac: z.string().optional(),
  internetId: z.string().optional(),
})

export const OrgUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  hosts: z.array(HostSchema).default([]),
})

export const OrgsWithUnitsSchema = z.object({
  success: z.boolean(),
  organizations: z.record(
    z.string(),
    z.object({
      id: z.string(),
      name: z.string(),
      domain: z.string(),
      status: z.string().optional(),
      plan: z.string().optional(),
      organizationalUnits: z.record(z.string(), OrgUnitSchema).default({}),
    })
  ),
  message: z.string().optional().default(''),
})

// Pricing plans
export const PricingPlansSchema = z.object({
  success: z.boolean(),
  plans: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      billingCycle: z.string(),
      features: z.array(z.string()),
      maxOrganizationalUnits: z.number(),
      maxHosts: z.number(),
      maxUsers: z.number(),
    })
  ),
  message: z.string().optional().default(''),
})

// Dev credentials
export const DevCredentialsSchema = z.object({
  success: z.boolean(),
  items: z.array(z.object({ email: z.string().email(), password: z.string(), role: z.enum(['admin', 'user']), domain: z.string() })).default([]),
})

// OIDC discovery
export const OidcDiscoverySchema = z.object({
  success: z.boolean(),
  discovery: z.object({
    issuer: z.string(),
    authorization_endpoint: z.string(),
    token_endpoint: z.string(),
    userinfo_endpoint: z.string(),
    jwks_uri: z.string(),
    response_types_supported: z.array(z.string()),
    subject_types_supported: z.array(z.string()),
    id_token_signing_alg_values_supported: z.array(z.string()),
    scopes_supported: z.array(z.string()),
    claims_supported: z.array(z.string()),
    end_session_endpoint: z.string().optional(),
  }),
  message: z.string().optional().default(''),
})

// Quotes
export const QuoteSchema = z.object({
  success: z.boolean(),
  calculation: z.object({
    planId: z.string(),
    planName: z.string(),
    baseCost: z.number(),
    userCost: z.number(),
    totalCost: z.number(),
    expectedUsers: z.number(),
    actualUsers: z.number(),
    isUnlimited: z.boolean(),
  }),
  message: z.string().optional().default(''),
})

export type OrganizationsResponse = z.infer<typeof OrganizationsResponseSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type CurrentUserResponse = z.infer<typeof CurrentUserSchema>
export type OrgsWithUnitsResponse = z.infer<typeof OrgsWithUnitsSchema>
export type PricingPlansResponse = z.infer<typeof PricingPlansSchema>
export type DevCredentialsResponse = z.infer<typeof DevCredentialsSchema>
export type OidcDiscoveryResponse = z.infer<typeof OidcDiscoverySchema>
export type QuoteResponse = z.infer<typeof QuoteSchema>

