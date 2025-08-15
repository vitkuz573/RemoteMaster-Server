import { env } from '@/lib/env'

export function FeatureFlags() {
  const flags: Array<{ k: string; v: string }> = [
    ['NEXT_PUBLIC_ERROR_REPORTING_ENABLED', String(env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED)],
    ['NEXT_PUBLIC_WEB_VITALS_ENABLED', String(env.NEXT_PUBLIC_WEB_VITALS_ENABLED)],
    ['NEXT_PUBLIC_CSP_REPORTING_ENABLED', String(env.NEXT_PUBLIC_CSP_REPORTING_ENABLED)],
    ['NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS', String(env.NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS)],
    ['NEXT_PUBLIC_FEATURE_DEBUG_TOASTS', String(env.NEXT_PUBLIC_FEATURE_DEBUG_TOASTS)],
    ['NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI', String(env.NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI)],
  ].map(([k, v]) => ({ k, v }))
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {flags.map((f) => (
        <div key={f.k}>
          <div className="text-xs text-muted-foreground">{f.k}</div>
          <div className="font-mono text-xs">{f.v}</div>
        </div>
      ))}
    </div>
  )
}

