"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronDown, CheckCircle2, XCircle, ExternalLink, Copy, RefreshCw, Braces } from 'lucide-react'
import { useEndpointsContext } from '@/contexts/endpoints-context'
import { env } from '@/lib/env'

type Method = 'GET' | 'HEAD'
type Check = { name: string; url?: string; method?: Method }

type Result = {
  name: string
  url?: string
  method: Method
  ok: boolean
  code?: number
  ms?: number
  error?: string
  headers?: { k: string; v: string }[]
  snippet?: string
}

const headerAllowlist = ['content-type', 'server', 'date', 'cache-control', 'x-powered-by']

function filterHeaders(h: Headers): { k: string; v: string }[] {
  const rows: { k: string; v: string }[] = []
  h.forEach((v, k) => {
    if (headerAllowlist.includes(k.toLowerCase())) rows.push({ k, v })
  })
  return rows
}

function useEndpointStatus(checks: Check[]) {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Record<string, number[]>>({})

  const run = async () => {
    setLoading(true)
    try {
      const out: Result[] = []
      for (const c of checks) {
        const start = performance.now()
        try {
          if (!c.url) { out.push({ name: c.name, url: c.url, method: c.method ?? 'GET', ok: false, error: 'No URL' }); continue }
          const res = await fetch(c.url, { method: c.method ?? 'GET', cache: 'no-store' })
          const ms = Math.round(performance.now() - start)
          let snippet: string | undefined
          if ((c.method ?? 'GET') === 'GET') {
            try { snippet = (await res.clone().text()).slice(0, 300) } catch {}
          }
          out.push({ name: c.name, url: c.url, method: c.method ?? 'GET', ok: res.ok, code: res.status, ms, headers: filterHeaders(res.headers), snippet })
        } catch (e) {
          const ms = Math.round(performance.now() - start)
          out.push({ name: c.name, url: c.url, method: c.method ?? 'GET', ok: false, ms, error: e instanceof Error ? e.message : String(e) })
        }
      }
      setResults(out)
      // Update history (keep last 20)
      const next: Record<string, number[]> = { ...history }
      for (const r of out) {
        const key = `about:endpoint:hist:${r.name}`
        let arr: number[] = []
        try { arr = JSON.parse(sessionStorage.getItem(key) || '[]') } catch { arr = [] }
        arr = [...arr, r.ms ?? 0].slice(-20)
        next[r.name] = arr
        try { sessionStorage.setItem(key, JSON.stringify(arr)) } catch {}
      }
      setHistory(next)
    } finally {
      setLoading(false)
    }
  }

  const runOne = async (name: string) => {
    const c = checks.find((x) => x.name === name)
    if (!c) return
    const start = performance.now()
    try {
      if (!c.url) {
        setResults((prev) => prev.map((r) => r.name === name ? ({ ...r, ok: false, error: 'No URL' }) : r))
        return
      }
      const res = await fetch(c.url, { method: c.method ?? 'GET', cache: 'no-store' })
      const ms = Math.round(performance.now() - start)
      let snippet: string | undefined
      if ((c.method ?? 'GET') === 'GET') {
        try { snippet = (await res.clone().text()).slice(0, 300) } catch {}
      }
      const updated: Result = { name: c.name, url: c.url, method: c.method ?? 'GET', ok: res.ok, code: res.status, ms, headers: filterHeaders(res.headers), snippet }
      setResults((prev) => prev.map((r) => r.name === name ? updated : r))
    } catch (e) {
      const ms = Math.round(performance.now() - start)
      setResults((prev) => prev.map((r) => r.name === name ? ({ ...r, ok: false, ms, error: e instanceof Error ? e.message : String(e) }) : r))
    }
  }

  useEffect(() => { void run() }, [])
  useEffect(() => {
    const loaded: Record<string, number[]> = {}
    for (const c of checks) {
      const key = `about:endpoint:hist:${c.name}`
      try { loaded[c.name] = JSON.parse(sessionStorage.getItem(key) || '[]') } catch { loaded[c.name] = [] }
    }
    setHistory(loaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { results, loading, run, runOne, history }
}

function latencyVariant(ms?: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!ms && ms !== 0) return 'outline'
  if (ms < 500) return 'default'
  if (ms < 1500) return 'secondary'
  return 'destructive'
}

function curlFor(r: Result): string {
  const u = r.url || ''
  return r.method === 'HEAD'
    ? `curl -I --max-time 5 ${u}`
    : `curl -sS -f --max-time 10 -H "Accept: application/json" ${u}`
}

function Sparkline({ points }: { points: number[] }) {
  const w = 60, h = 16
  if (!points || points.length === 0) return null
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 1)
  const step = w / Math.max(points.length - 1, 1)
  const path = points.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / span) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-muted-foreground">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function EndpointsTable() {
  const checks = useMemo<Check[]>(() => {
    // Helper: parse NEXT_PUBLIC_ENDPOINTS if provided
    const cfg = env.NEXT_PUBLIC_ENDPOINTS
    const parsedFromEnv: Check[] = []
    if (cfg && cfg.trim()) {
      try {
        if (cfg.trim().startsWith('[') || cfg.trim().startsWith('{')) {
          const arr = JSON.parse(cfg)
          if (Array.isArray(arr)) {
            for (const it of arr) {
              if (!it) continue
              const name = String(it.name || '').trim()
              const url = String(it.url || '').trim()
              const method = String(it.method || 'GET').toUpperCase() as Method
              if (name && url) parsedFromEnv.push({ name, url, method: method === 'HEAD' ? 'HEAD' : 'GET' })
            }
          }
        } else {
          // CSV: Name|URL|METHOD,Name|URL|METHOD
          const items = cfg.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean)
          for (const item of items) {
            const [name, url, methodRaw] = item.split('|')
            if (!name || !url) continue
            const method = String(methodRaw || 'GET').toUpperCase() as Method
            parsedFromEnv.push({ name: name.trim(), url: url.trim(), method: method === 'HEAD' ? 'HEAD' : 'GET' })
          }
        }
      } catch {
        // ignore parse errors; fall back to defaults
      }
    }
    return parsedFromEnv
  }, [])

  const { results, loading, run, runOne, history } = useEndpointStatus(checks)
  const { intervalSec, setIntervalSec, setRemaining, remaining, setSummary, setRunner } = useEndpointsContext()
  const countdownRef = useRef<number | null>(null)
  const runRef = useRef(run)

  // Keep latest run in a ref to avoid effect dependency loops
  useEffect(() => { runRef.current = run }, [run])

  useEffect(() => {
    if (!intervalSec) { if (countdownRef.current) { window.clearInterval(countdownRef.current); countdownRef.current = null } return }
    setRemaining(intervalSec)
    countdownRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { void runRef.current(); return intervalSec }
        return r - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) window.clearInterval(countdownRef.current) }
  }, [intervalSec, setRemaining])

  const copy = (s: string) => void navigator.clipboard?.writeText(s)

  // Publish summary to context when results change
  useEffect(() => {
    const total = results.length || checks.length
    const ok = results.filter(r => r.ok).length
    const worstMs = results.length ? Math.max(...results.map(r => r.ms ?? 0)) : null
    const slow = results.filter(r => (r.ms ?? 0) >= 1500).length
    setSummary({ total, ok, slow, worstMs })
  }, [results, checks.length, setSummary])

  // Provide a stable runner into context (once), executing latest run from ref
  useEffect(() => {
    setRunner(() => () => runRef.current())
    return () => setRunner(undefined)
  }, [setRunner])

  return (
    <TooltipProvider>
      {/* Header controls moved to CardAction via EndpointsHeaderControls */}
      {checks.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Name</TableHead>
            <TableHead className="hidden lg:table-cell">URL</TableHead>
            <TableHead className="hidden md:table-cell">Code</TableHead>
            <TableHead>Latency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((c) => {
            const r = results.find((x) => x.name === c.name)
            const ok = r?.ok
            const statusIcon = ok ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" aria-hidden />
            )
            return (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="hidden lg:table-cell font-mono text-xs truncate" title={c.url || ''}>{c.url || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{r?.code ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={latencyVariant(r?.ms)}>{r?.ms ? `${r.ms} ms` : '—'}</Badge>
                    <div className="hidden md:block">
                      {history[c.name] && history[c.name].length ? <Sparkline points={history[c.name]} /> : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    {statusIcon}
                    <span className="text-sm">{ok === undefined ? '—' : ok ? 'OK' : 'Fail'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="sm" className="h-7 px-2">
                          <a href={c.url} target="_blank" rel="noreferrer noopener" aria-label="Open">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2" aria-label="Copy URL" onClick={() => c.url && copy(c.url)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy URL</TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2" aria-label="More">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => r && copy(curlFor(r))}>Copy cURL</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => runOne(c.name)}>Re-check</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      ) : (
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          No endpoints configured. Set NEXT_PUBLIC_ENDPOINTS in .env.local (JSON or CSV).
        </div>
      )}
      {/* Inline details */}
      {results.length > 0 && (
      <div className="mt-3 grid gap-2">
        {results.map((r) => (
          <details key={r.name} className="rounded-md border p-3">
            <summary className="cursor-pointer select-none text-sm font-medium flex items-center gap-2">
              <Braces className="h-4 w-4" /> {r.name} details
            </summary>
            <div className="mt-2 grid gap-2 text-xs">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-muted-foreground">Method</span>
                <span className="font-mono">{r.method}</span>
                <span className="text-muted-foreground">URL</span>
                <span className="font-mono break-all">{r.url}</span>
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono">{r.code ?? '—'}</span>
                <span className="text-muted-foreground">Latency</span>
                <span className="font-mono">{r.ms ? `${r.ms} ms` : '—'}</span>
                {r.error ? (<>
                  <span className="text-muted-foreground">Error</span>
                  <span className="font-mono break-words">{r.error}</span>
                </>) : null}
              </div>
              {r.headers && r.headers.length ? (
                <div>
                  <div className="text-muted-foreground mb-1">Headers</div>
                  <div className="text-xs space-y-1">
                    {r.headers.map((h) => (
                      <div key={h.k} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">{h.k}</span>
                        <span className="font-mono break-all">{h.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {r.snippet ? (
                <div>
                  <div className="text-muted-foreground mb-1">Body snippet</div>
                  <pre className="rounded-md border p-2 text-xs overflow-x-auto whitespace-pre-wrap">{r.snippet}</pre>
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>
      )}
    </TooltipProvider>
  )
}
