import { env } from '@/lib/env'

function isOperationalKey(k: string) {
  // Public, non-feature toggles that indicate behavior (e.g., *_ENABLED)
  return k.startsWith('NEXT_PUBLIC_') && !k.startsWith('NEXT_PUBLIC_FEATURE_') && /ENABLE(D)?/i.test(k)
}

export function OperationalToggles() {
  const toggles = Object.entries(env)
    .filter(([k]) => isOperationalKey(k))
    .map(([k, v]) => ({ k, v: String(v as any) }))
    .sort((a, b) => a.k.localeCompare(b.k))

  if (toggles.length === 0) {
    return <div className="text-sm text-muted-foreground">No operational toggles detected.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {toggles.map((t) => (
        <div key={t.k}>
          <div className="text-xs text-muted-foreground">{t.k.replace('NEXT_PUBLIC_', '')}</div>
          <div className="font-mono text-xs">{t.v}</div>
        </div>
      ))}
    </div>
  )
}

