"use client"

import { useMemo, useState } from 'react'
import { env } from '@/lib/env'
import { featureMeta } from '@/lib/feature-flags.meta'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Clipboard, CheckCircle2, XCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
            <TableHead className="w-[46%]">Flag</TableHead>
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
                    {f.bool ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                    )}
                    <Badge variant={f.bool ? 'default' : 'secondary'} className={f.bool ? '' : 'opacity-70'}>
                      {f.bool ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label="Copy env" title="Copy env" variant="outline" size="sm" className="h-7 px-2">
                          <Clipboard className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copy(f.k, true)}>Copy true</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copy(f.k, false)}>Copy false</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
