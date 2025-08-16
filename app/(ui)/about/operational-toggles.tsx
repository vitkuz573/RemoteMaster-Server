"use client"

import { useMemo, useState } from 'react'
import { env } from '@/lib/env'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

type ToggleMeta = { title: string; description?: string }

const operationalMeta: Record<string, ToggleMeta> = {
  ERROR_REPORTING_ENABLED: {
    title: 'Error reporting',
    description: 'Enable client error reporting (e.g., Sentry capture).',
  },
  WEB_VITALS_ENABLED: {
    title: 'Web Vitals',
    description: 'Collect and report Web Vitals metrics.',
  },
  CSP_REPORTING_ENABLED: {
    title: 'CSP reporting',
    description: 'Enable Content-Security-Policy violation reporting.',
  },
}

export function OperationalToggles() {
  const all = useMemo(() => {
    const entries = Object.entries(env)
      .filter(([k]) => k.startsWith('NEXT_PUBLIC_') && !k.startsWith('NEXT_PUBLIC_FEATURE_') && /ENABLE(D)?/i.test(k))
      .map(([k, v]) => ({ k, bool: Boolean(v as any), raw: String(v as any) }))
      .sort((a, b) => a.k.localeCompare(b.k))
    return entries
  }, [])

  const [query, setQuery] = useState('')
  const [onlyEnabled, setOnlyEnabled] = useState(false)

  const toggles = useMemo(() => {
    let list = all
    if (onlyEnabled) list = list.filter((t) => t.bool)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((t) => t.k.toLowerCase().includes(q))
    }
    return list
  }, [all, onlyEnabled, query])

  if (toggles.length === 0) {
    return <div className="text-sm text-muted-foreground">No operational toggles detected.</div>
  }

  const copy = (k: string, v: boolean) => void navigator.clipboard?.writeText(`${k}=${v ? 'true' : 'false'}`)

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
            <TableHead className="w-[40%]">Toggle</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toggles.map((t) => {
            const short = t.k.replace('NEXT_PUBLIC_', '')
            const meta = operationalMeta[short]
            return (
              <TableRow key={t.k}>
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
                    <span className="truncate">{short}</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{t.k}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{t.raw}</TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <Switch checked={t.bool} onCheckedChange={() => {}} disabled />
                    <Badge variant={t.bool ? 'default' : 'secondary'} className={t.bool ? '' : 'opacity-70'}>
                      {t.bool ? 'On' : 'Off'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => copy(t.k, true)}>Copy true</Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => copy(t.k, false)}>Copy false</Button>
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
