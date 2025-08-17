"use client"

import { useEffect, useMemo, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Check = { name: string; url?: string; method?: 'GET'|'HEAD' }
type Result = { name: string; ok: boolean; code?: number; ms?: number }

function useChecks(checks: Check[]) {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const entries: Result[] = []
      for (const c of checks) {
        const start = performance.now()
        try {
          if (!c.url) {
            entries.push({ name: c.name, ok: false })
            continue
          }
          const res = await fetch(c.url, { method: c.method ?? 'GET', cache: 'no-store' })
          const ms = Math.round(performance.now() - start)
          entries.push({ name: c.name, ok: res.ok, code: res.status, ms })
        } catch {
          const ms = Math.round(performance.now() - start)
          entries.push({ name: c.name, ok: false, ms })
        }
      }
      setResults(entries)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void run() }, [])
  return { results, loading, run }
}

export function OverallStatus() {
  const checks = useMemo<Check[]>(() => ([
    { name: 'API', url: appConfig.endpoints.api, method: 'HEAD' },
    { name: 'Health', url: appConfig.endpoints.health, method: 'GET' },
    { name: 'Status', url: appConfig.endpoints.status, method: 'GET' },
  ]), [])
  const { results, loading, run } = useChecks(checks)

  const allOk = results.length > 0 && results.every(r => r.ok)
  const slow = results.some(r => (r.ms ?? 0) >= 1500)
  const variant = results.length === 0 ? 'outline' : allOk ? (slow ? 'secondary' : 'default') : 'destructive'
  const okCount = results.filter(r => r.ok).length

  return (
    <div className="flex items-center gap-3">
      <Badge variant={variant as any}>
        {results.length === 0 ? 'unknown' : allOk ? `OK • ${okCount}/${checks.length}` : `Issues • ${okCount}/${checks.length}`}
      </Badge>
      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={run} disabled={loading}>
        {loading ? 'Checking…' : 'Re-check'}
      </Button>
    </div>
  )
}
