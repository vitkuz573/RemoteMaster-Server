"use client"

import { useMemo, useState } from 'react'
import { env } from '@/lib/env'
import { featureMeta } from '@/lib/feature-flags.meta'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function isFeatureKey(k: string) {
  return k.startsWith('NEXT_PUBLIC_FEATURE_')
}

export function FeatureFlags() {
  const all = useMemo(() => (
    Object.entries(env)
      .filter(([k]) => isFeatureKey(k))
      .map(([k, v]) => ({ k, bool: Boolean(v as any), raw: String(v as any) }))
      .sort((a, b) => a.k.localeCompare(b.k))
  ), [])

  const [query, setQuery] = useState('')
  const [onlyEnabled, setOnlyEnabled] = useState(false)

  const flags = useMemo(() => {
    let list = all
    if (onlyEnabled) list = list.filter((f) => f.bool)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((f) => f.k.toLowerCase().includes(q))
    }
    return list
  }, [all, onlyEnabled, query])

  if (flags.length === 0) {
    return <div className="text-sm text-muted-foreground">No feature flags detected.</div>
  }

  const copy = (k: string, v: boolean) => {
    void navigator.clipboard?.writeText(`${k}=${v ? 'true' : 'false'}`)
  }

  return (
    <TooltipProvider>
      <div className="mb-2 flex items-center gap-2 text-xs">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-7 w-32 rounded border px-2 text-xs bg-background"
        />
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setOnlyEnabled((v) => !v)}>
          {onlyEnabled ? 'Show all' : 'Only enabled'}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {flags.map((f) => {
          const key = f.k.replace('NEXT_PUBLIC_FEATURE_', '')
          const meta = featureMeta[key]
          return (
            <div key={f.k} className="rounded-md border p-3">
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
                <Badge variant={f.bool ? 'default' : 'secondary'} className={f.bool ? '' : 'opacity-70'}>
                  {f.bool ? 'On' : 'Off'}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{f.raw}</span>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => copy(f.k, true)}>Copy true</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => copy(f.k, false)}>Copy false</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
