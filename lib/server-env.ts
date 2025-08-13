import { z } from 'zod'

const toBool = (v: unknown, def = false) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
  return def
}

const ServerEnvSchema = z.object({
  // Security toggles (server-only)
  ENFORCE_HTTPS: z.preprocess((v) => toBool(v, process.env.NODE_ENV === 'production'), z.boolean()).default(true),
  ENABLE_COOP_COEP: z.preprocess((v) => toBool(v, false), z.boolean()).default(false),
  ENABLE_TRUSTED_TYPES: z.preprocess((v) => toBool(v, false), z.boolean()).default(false),
})

export const serverEnv = ServerEnvSchema.parse({
  ENFORCE_HTTPS: process.env.ENFORCE_HTTPS,
  ENABLE_COOP_COEP: process.env.ENABLE_COOP_COEP,
  ENABLE_TRUSTED_TYPES: process.env.ENABLE_TRUSTED_TYPES,
})

export type ServerEnv = typeof serverEnv

