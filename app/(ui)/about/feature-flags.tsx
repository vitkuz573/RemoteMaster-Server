import { env } from '@/lib/env'

function isFeatureKey(k: string) {
  return k.startsWith('NEXT_PUBLIC_FEATURE_')
}

export function FeatureFlags() {
  // Auto-detect flags by NEXT_PUBLIC_FEATURE_* prefix only
  const flags = Object.entries(env)
    .filter(([k]) => isFeatureKey(k))
    .map(([k, v]) => ({ k, v: String(v as any) }))
    .sort((a, b) => a.k.localeCompare(b.k))

  if (flags.length === 0) {
    return <div className="text-sm text-muted-foreground">No feature flags detected.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {flags.map((f) => (
        <div key={f.k}>
          <div className="text-xs text-muted-foreground">{f.k.replace('NEXT_PUBLIC_FEATURE_', '')}</div>
          <div className="font-mono text-xs">{f.v}</div>
        </div>
      ))}
    </div>
  )
}
