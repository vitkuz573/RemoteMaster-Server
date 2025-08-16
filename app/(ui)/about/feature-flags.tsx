"use client"

import { useMemo, useState } from 'react'
import { env } from '@/lib/env'
import { featureMeta } from '@/lib/feature-flags.meta'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Clipboard } from 'lucide-react'

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Flag</TableHead>
            <TableHead className="hidden xl:table-cell">Key</TableHead>
            <TableHead className="hidden lg:table-cell">Value</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags.map((f) => {
            const key = f.k.replace('NEXT_PUBLIC_FEATURE_', '')
            const meta = featureMeta[key]
            return (
              <TableRow key={f.k}>
                <TableCell className="max-w-0">
                  {meta ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger className="underline decoration-dotted underline-offset-2 truncate">
                        {meta.title}
                      </TooltipTrigger>
                      {meta.description ? (
                        <TooltipContent className="max-w-xs">{meta.description}</TooltipContent>
                      ) : null}
                    </Tooltip>
                  ) : (
                    <span className="truncate">{key}</span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell font-mono text-xs">{f.k}</TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{f.raw}</TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <Switch className="hidden xl:inline-flex" checked={f.bool} onCheckedChange={() => {}} disabled />
                    <Badge variant={f.bool ? 'default' : 'secondary'} className={f.bool ? '' : 'opacity-70'}>
                      {f.bool ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Button aria-label="Copy true" title="Copy true" variant="outline" size="sm" className="h-7 px-2" onClick={() => copy(f.k, true)}>
                          <Clipboard className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy true</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Button aria-label="Copy false" title="Copy false" variant="outline" size="sm" className="h-7 px-2" onClick={() => copy(f.k, false)}>
                          <Clipboard className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy false</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
