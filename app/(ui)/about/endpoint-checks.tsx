"use client"

import { useEffect, useMemo, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Check = {
  name: string
  url?: string
  method?: 'GET' | 'HEAD'
}

type Result = {
  status: 'ok' | 'fail' | 'unknown'
  code?: number
  ms?: number
  error?: string
}

function useEndpointChecks(checks: Check[]) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    try {
      const promises = checks.map(async (c) => {
        const start = performance.now()
        let res: Response | null = null
        try {
          if (!c.url) throw new Error('no url')
          res = await fetch(c.url, { method: c.method ?? 'GET', signal: controller.signal, cache: 'no-store' })
          const ms = Math.round(performance.now() - start)
          return [c.name, { status: res.ok ? 'ok' : 'fail', code: res.status, ms }] as const
        } catch (e) {
          const ms = Math.round(performance.now() - start)
          const msg = e instanceof Error ? e.message : String(e)
          return [c.name, { status: 'fail', error: msg, ms }] as const
        }
      })
      const entries = await Promise.all(promises)
      setResults(Object.fromEntries(entries))
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  useEffect(() => { void run() }, [])
  return { results, loading, run }
}

export function EndpointChecks() {
  const checks = useMemo<Check[]>(() => ([
    { name: 'API', url: appConfig.endpoints.api, method: 'HEAD' },
    { name: 'Health', url: appConfig.endpoints.health, method: 'GET' },
    { name: 'Status', url: appConfig.endpoints.status, method: 'GET' },
  ]), [])
  const { results, loading, run } = useEndpointChecks(checks)

  return (
    <div className="space-y-3">
      {checks.map((c) => {
        const r = results[c.name]
        return (
          <div key={c.name} className="flex items-center justify-between gap-3">
            <div className="min-w-24 text-sm text-muted-foreground">{c.name}</div>
            <div className="flex-1 truncate font-mono text-sm">
              {c.url || '—'}
            </div>
            <div className="flex items-center gap-2">
              <LatencyBadge result={r} />
              <StatusBadge result={r} />
            </div>
          </div>
        )
      })}
      <div className="pt-2">
        <Button variant="outline" size="sm" onClick={() => run()} disabled={loading}>
          {loading ? 'Checking…' : 'Re-check'}
        </Button>
      </div>
    </div>
  )
}

function LatencyBadge({ result }: { result?: Result }) {
  if (!result?.ms) return <Badge variant="outline">—</Badge>
  const ms = result.ms
  const ok = ms < 500 ? 'default' : ms < 1500 ? 'secondary' : 'destructive'
  return <Badge variant={ok as any}>{ms} ms</Badge>
}

function StatusBadge({ result }: { result?: Result }) {
  if (!result) return <Badge variant="outline">unknown</Badge>
  if (result.status === 'ok') return <Badge>OK{result.code ? ` • ${result.code}` : ''}</Badge>
  if (result.status === 'fail') return <Badge variant="destructive">Fail{result.code ? ` • ${result.code}` : ''}</Badge>
  return <Badge variant="outline">unknown</Badge>
}

