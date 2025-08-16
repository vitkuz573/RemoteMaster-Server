"use client"

import { useEffect, useMemo, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertTriangle, XCircle, Timer, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Check = { name: string; url?: string; method?: 'GET'|'HEAD' }
type Result = { name: string; ok: boolean; code?: number; ms?: number; url?: string }

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
          if (!c.url) { entries.push({ name: c.name, ok: false, url: c.url }); continue }
          const res = await fetch(c.url, { method: c.method ?? 'GET', cache: 'no-store' })
          const ms = Math.round(performance.now() - start)
          entries.push({ name: c.name, ok: res.ok, code: res.status, ms, url: c.url })
        } catch {
          const ms = Math.round(performance.now() - start)
          entries.push({ name: c.name, ok: false, ms, url: c.url })
        }
      }
      setResults(entries)
    } finally { setLoading(false) }
  }
  useEffect(() => { void run() }, [])
  return { results, loading, run }
}

export function StatusPanel() {
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
  const t = useTranslations('common')

  const download = () => {
    const blob = new Blob([JSON.stringify({ results, generatedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'status-results.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={variant as any}>
          {results.length === 0 ? t('unknown') : allOk ? `${t('ok_label')} • ${okCount}/${checks.length}` : `Issues • ${okCount}/${checks.length}`}
        </Badge>
        <button className="text-xs underline" onClick={run} disabled={loading}>
          {loading ? t('measuring') : t('recheck_btn')}
        </button>
        <Button size="sm" variant="outline" onClick={download}><Download className="size-3 mr-1"/>{t('export_json')}</Button>
      </div>
      <div className="space-y-2 text-sm">
        {results.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-28">
              {r.ok ? <CheckCircle2 className="size-4 text-green-600"/> : <XCircle className="size-4 text-red-600"/>}
              <span className="font-medium">{r.name}</span>
              {r.code ? <span className="text-xs text-muted-foreground">{r.code}</span> : null}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="size-3.5 text-muted-foreground"/>
              <span className="font-mono text-xs">{r.ms ?? '—'} ms</span>
            </div>
            <div className="flex items-center gap-2">
              {r.url ? <a className="text-xs underline" href={r.url} target="_blank" rel="noreferrer noopener">Open</a> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="pt-1 text-xs text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-green-600"/>{t('ok_label')}</span>
        <span className="flex items-center gap-1"><AlertTriangle className="size-3 text-yellow-600"/>{t('slow_label')}</span>
        <span className="flex items-center gap-1"><XCircle className="size-3 text-red-600"/>{t('fail_label')}</span>
      </div>
    </div>
  )
}
