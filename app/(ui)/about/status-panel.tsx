"use client"

import { useEffect, useMemo, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, AlertTriangle, XCircle, Timer, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Check = { name: string; url?: string; method?: 'GET'|'HEAD' }
type Result = { name: string; ok: boolean; code?: number; ms?: number; url?: string }

function useChecks(checks: Check[]) {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Record<string, number[]>>({})
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
      // update sparkline history in sessionStorage (keep last 20)
      const next: Record<string, number[]> = { ...history }
      for (const e of entries) {
        const key = `about:status:hist:${e.name}`
        let arr: number[] = []
        try { arr = JSON.parse(sessionStorage.getItem(key) || '[]') } catch { arr = [] }
        arr = [...arr, e.ms ?? 0].slice(-20)
        next[e.name] = arr
        try { sessionStorage.setItem(key, JSON.stringify(arr)) } catch {}
      }
      setHistory(next)
    } finally { setLoading(false) }
  }
  useEffect(() => { void run() }, [])
  useEffect(() => {
    const loaded: Record<string, number[]> = {}
    for (const c of checks) {
      const key = `about:status:hist:${c.name}`
      try { loaded[c.name] = JSON.parse(sessionStorage.getItem(key) || '[]') } catch { loaded[c.name] = [] }
    }
    setHistory(loaded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { results, loading, run, history }
}

export function StatusPanel() {
  const checks = useMemo<Check[]>(() => ([
    { name: 'API', url: appConfig.endpoints.api, method: 'HEAD' },
    { name: 'Health', url: appConfig.endpoints.health, method: 'GET' },
    { name: 'Status', url: appConfig.endpoints.status, method: 'GET' },
  ]), [])

  const { results, loading, run, history } = useChecks(checks)
  const allOk = results.length > 0 && results.every(r => r.ok)
  const slow = results.some(r => (r.ms ?? 0) >= 1500)
  const variant = results.length === 0 ? 'outline' : allOk ? (slow ? 'secondary' : 'default') : 'destructive'
  const okCount = results.filter(r => r.ok).length
  const t = useTranslations('common')

  const [intervalSec, setIntervalSec] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(0)
  useEffect(() => {
    if (!intervalSec) return
    setRemaining(intervalSec)
    const tick = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { void run(); return intervalSec }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [intervalSec])

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
        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={run} disabled={loading}>
          {loading ? t('measuring') : t('recheck_btn')}
        </Button>
        <Button size="sm" variant="outline" onClick={download}><Download className="size-3 mr-1"/>{t('export_json')}</Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{t('refresh_every')}</span>
          <Select value={intervalSec ? String(intervalSec) : ''} onValueChange={(v) => setIntervalSec(v ? Number(v) : null)}>
            <SelectTrigger className="h-7 w-[80px] text-xs">
              <SelectValue placeholder={t('off')} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="">{t('off')}</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">60s</SelectItem>
            </SelectContent>
          </Select>
          {intervalSec ? <span className="ml-2">{t('next_in', {sec: remaining})}</span> : null}
        </div>
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
            <Sparkline data={history[r.name] ?? []} />
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

function Sparkline({ data }: { data: number[] }) {
  const w = 60, h = 16
  if (!data || data.length === 0) return <svg width={w} height={h} />
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const scaleX = (i: number) => (i / Math.max(data.length - 1, 1)) * (w - 2) + 1
  const scaleY = (v: number) => h - 1 - ((v - min) / (max - min || 1)) * (h - 2)
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ')
  return (
    <svg width={w} height={h} className="text-muted-foreground">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
