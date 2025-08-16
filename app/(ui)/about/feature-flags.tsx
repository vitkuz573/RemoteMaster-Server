import { env } from '@/lib/env'
import { featureMeta } from '@/lib/feature-flags.meta'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {flags.map((f) => {
          const key = f.k.replace('NEXT_PUBLIC_FEATURE_', '')
          const meta = featureMeta[key]
          return (
            <div key={f.k}>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                {meta ? (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                      {meta.title}
                    </TooltipTrigger>
                    {meta.description ? (
                      <TooltipContent className="max-w-xs">{meta.description}</TooltipContent>
                    ) : null}
                  </Tooltip>
                ) : (
                  key
                )}
              </div>
              <div className="font-mono text-xs">{f.v}</div>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
