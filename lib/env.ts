import { z } from 'zod'

// Shared, validated environment variables (client-safe NEXT_PUBLIC_*)
const toBool = (v: unknown, def = false) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
  return def;
};

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_HEALTH_URL: z.string().url().default('http://localhost:3001/health'),
  NEXT_PUBLIC_STATUS_URL: z.string().url().default('http://localhost:3001/status'),

  NEXT_PUBLIC_SUPPORT_AVAILABILITY: z.string().optional().default('Mon–Fri, 9:00–18:00'),
  NEXT_PUBLIC_SUPPORT_RESPONSE_TIME: z.string().optional().default('within 24h'),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional().default('support@example.com'),
  NEXT_PUBLIC_SUPPORT_PHONE: z.string().optional().default(''),
  NEXT_PUBLIC_SUPPORT_WEBSITE: z.string().url().optional().default('https://example.com/support'),
  NEXT_PUBLIC_DOCS_URL: z.string().url().optional().default('https://example.com/docs'),
  NEXT_PUBLIC_COMMUNITY_URL: z.string().url().optional().default('https://community.example.com'),

  NEXT_PUBLIC_REPO_URL: z.string().url().optional().default('https://github.com/vitkuz573/RemoteMaster-Server'),
  NEXT_PUBLIC_REPO_TYPE: z.enum(['github', 'gitlab', 'bitbucket']).optional().default('github'),
  NEXT_PUBLIC_REPO_BRANCH: z.string().optional().default('main'),

  NEXT_PUBLIC_BUILD_DATE: z.string().optional(),
  NEXT_PUBLIC_BUILD_TIME: z.string().optional(),
  NEXT_PUBLIC_BUILD_HASH: z.string().optional(),
  NEXT_PUBLIC_BUILD_BRANCH: z.string().optional(),
  NEXT_PUBLIC_BUILD_TIMESTAMP: z.string().optional(),

  NEXT_PUBLIC_ERROR_REPORTING_ENABLED: z.preprocess((v) => toBool(v), z.boolean()).default(false),
  NEXT_PUBLIC_WEB_VITALS_ENABLED: z.preprocess((v) => toBool(v), z.boolean()).default(false),
  NEXT_PUBLIC_CSP_REPORTING_ENABLED: z.preprocess((v) => toBool(v), z.boolean()).default(true),
  // Feature flags (client-safe)
  NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS: z.preprocess((v) => toBool(v, process.env.NODE_ENV !== 'production'), z.boolean()).default(process.env.NODE_ENV !== 'production'),
  NEXT_PUBLIC_FEATURE_DEBUG_TOASTS: z.preprocess((v) => toBool(v, false), z.boolean()).default(false),
  NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI: z.preprocess((v) => toBool(v, false), z.boolean()).default(false),
})

// Narrowed process env for client-safe keys
const raw = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_HEALTH_URL: process.env.NEXT_PUBLIC_HEALTH_URL,
  NEXT_PUBLIC_STATUS_URL: process.env.NEXT_PUBLIC_STATUS_URL,

  NEXT_PUBLIC_SUPPORT_AVAILABILITY: process.env.NEXT_PUBLIC_SUPPORT_AVAILABILITY,
  NEXT_PUBLIC_SUPPORT_RESPONSE_TIME: process.env.NEXT_PUBLIC_SUPPORT_RESPONSE_TIME,
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  NEXT_PUBLIC_SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
  NEXT_PUBLIC_SUPPORT_WEBSITE: process.env.NEXT_PUBLIC_SUPPORT_WEBSITE,
  NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
  NEXT_PUBLIC_COMMUNITY_URL: process.env.NEXT_PUBLIC_COMMUNITY_URL,

  NEXT_PUBLIC_REPO_URL: process.env.NEXT_PUBLIC_REPO_URL,
  NEXT_PUBLIC_REPO_TYPE: process.env.NEXT_PUBLIC_REPO_TYPE as any,
  NEXT_PUBLIC_REPO_BRANCH: process.env.NEXT_PUBLIC_REPO_BRANCH,

  NEXT_PUBLIC_BUILD_DATE: process.env.NEXT_PUBLIC_BUILD_DATE,
  NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
  NEXT_PUBLIC_BUILD_HASH: process.env.NEXT_PUBLIC_BUILD_HASH,
  NEXT_PUBLIC_BUILD_BRANCH: process.env.NEXT_PUBLIC_BUILD_BRANCH,
  NEXT_PUBLIC_BUILD_TIMESTAMP: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP,

  NEXT_PUBLIC_ERROR_REPORTING_ENABLED: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED,
  NEXT_PUBLIC_WEB_VITALS_ENABLED: process.env.NEXT_PUBLIC_WEB_VITALS_ENABLED,
  NEXT_PUBLIC_CSP_REPORTING_ENABLED: process.env.NEXT_PUBLIC_CSP_REPORTING_ENABLED,
  NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS: process.env.NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS,
  NEXT_PUBLIC_FEATURE_DEBUG_TOASTS: process.env.NEXT_PUBLIC_FEATURE_DEBUG_TOASTS,
  NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI: process.env.NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI,
}

export const env = ClientEnvSchema.parse(raw)

// Helper to expose safe values
export type Env = typeof env
