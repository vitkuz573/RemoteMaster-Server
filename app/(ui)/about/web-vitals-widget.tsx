"use client"

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Rating = 'good' | 'needs-improvement' | 'poor'
type Sample = { ts: number; value: number; rating?: Rating }
type Hist = Record<string, Sample[]>

const ORDER = ['TTFB', 'FCP', 'LCP', 'INP', 'CLS'] as const
const THRESHOLDS: Record<(typeof ORDER)[number], { good: number; ni: number; unit: string; doc: string }> = {
  TTFB: { good: 800, ni: 1800, unit: 'ms', doc: 'https://web.dev/ttfb/' },
  FCP:  { good: 1800, ni: 3000, unit: 'ms', doc: 'https://web.dev/fcp/' },
  LCP:  { good: 2500, ni: 4000, unit: 'ms', doc: 'https://web.dev/lcp/' },
  INP:  { good: 200, ni: 500, unit: 'ms', doc: 'https://web.dev/inp/' },
  CLS:  { good: 0.1, ni: 0.25, unit: '',  doc: 'https://web.dev/cls/' },
}

function toRating(name: string, v: number): Rating {
  // CLS is unitless; others are ms
  // For CLS, thresholds are not in ms; keep as is
  // For others, values from web-vitals are already in ms for TTFB/FCP/LCP/INP v4
  const k = name as (typeof ORDER)[number]
  const t = THRESHOLDS[k]
  if (!t) return 'good'
  return v <= t.good ? 'good' : v <= t.ni ? 'needs-improvement' : 'poor'
}

function variantBy(r?: Rating) {
  return r === 'good' ? 'default' : r === 'needs-improvement' ? 'secondary' : r === 'poor' ? 'destructive' : 'outline'
}

function Sparkline({ data }: { data: number[] }) {
  const w = 80, h = 18
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

export function WebVitalsWidget() {
  const [hist, setHist] = useState<Hist>({})

  // Load history from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('about:webvitals:hist')
      if (raw) setHist(JSON.parse(raw))
    } catch {}
  }, [])

  // Subscribe to web-vitals updates
  useEffect(() => {
    let unsubscribed = false
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const push = (m: any) => {
        if (unsubscribed) return
        const name = String(m.name)
        const value = typeof m.value === 'number' ? Math.round(m.value * (name === 'CLS' ? 1000 : 1)) / (name === 'CLS' ? 1000 : 1) : 0
        const rating = m.rating as Rating | undefined
        setHist((prev) => {
          const prevArr = prev[name] || []
          const nextArr = [...prevArr, { ts: Date.now(), value, rating: rating ?? toRating(name, value) }].slice(-40)
          const next = { ...prev, [name]: nextArr }
          try { sessionStorage.setItem('about:webvitals:hist', JSON.stringify(next)) } catch {}
          return next
        })
      }
      const opts = { reportAllChanges: true } as any
      onCLS(push, opts); onINP(push, opts); onLCP(push, opts); onFCP(push, opts); onTTFB(push, opts)
    })
    return () => { unsubscribed = true }
  }, [])

  const latest = useMemo(() => {
    const out: Record<string, Sample | undefined> = {}
    for (const k of ORDER) out[k] = (hist[k] || [])[ (hist[k]?.length || 1) - 1 ]
    return out
  }, [hist])

  const fmt = (name: string, v?: number) => v === undefined ? '—' : name === 'CLS' ? v.toFixed(3) : `${Math.round(v)}ms`

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(hist, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'web-vitals.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const clearHist = () => {
    setHist({})
    try { sessionStorage.removeItem('about:webvitals:hist') } catch {}
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {ORDER.map((k) => {
            const m = latest[k]
            return (
              <Tooltip key={k}>
                <TooltipTrigger asChild>
                  <Badge variant={variantBy(m?.rating) as any}>
                    {k}: {fmt(k, m?.value)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium mb-1">{k}</div>
                    <div>Good ≤ {THRESHOLDS[k].good}{THRESHOLDS[k].unit}</div>
                    <div>Needs improvement ≤ {THRESHOLDS[k].ni}{THRESHOLDS[k].unit}</div>
                    <div className="mt-1"><a className="underline" href={THRESHOLDS[k].doc} target="_blank" rel="noreferrer noopener">Docs</a></div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={exportJson}>Export JSON</Button>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={clearHist}>Clear</Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[22%]">Metric</TableHead>
                <TableHead className="w-[14%]">Current</TableHead>
                <TableHead className="w-[14%]">Avg</TableHead>
                <TableHead className="w-[18%]">P75 / P95</TableHead>
                <TableHead className="w-[18%]">Min / Max</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDER.map((k) => {
                const arr = hist[k] || []
                const values = arr.map((s) => s.value)
                const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined
                const min = values.length ? Math.min(...values) : undefined
                const max = values.length ? Math.max(...values) : undefined
                const pct = (p: number) => {
                  if (!values.length) return undefined
                  const sorted = [...values].sort((a,b)=>a-b)
                  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p/100) * (sorted.length - 1))))
                  return sorted[idx]
                }
                const p75 = pct(75)
                const p95 = pct(95)
                const cur = latest[k]?.value
                return (
                  <TableRow key={k}>
                    <TableCell className="font-medium">{k}</TableCell>
                    <TableCell className="font-mono text-xs">{fmt(k, cur)}</TableCell>
                    <TableCell className="font-mono text-xs">{avg !== undefined ? fmt(k, k==='CLS'? Number(avg.toFixed(3)) : Math.round(avg)) : '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{p75 !== undefined && p95 !== undefined ? `${fmt(k, k==='CLS'? Number(p75.toFixed(3)) : Math.round(p75))} / ${fmt(k, k==='CLS'? Number(p95.toFixed(3)) : Math.round(p95))}` : '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{min !== undefined && max !== undefined ? `${fmt(k, k==='CLS'? Number(min.toFixed(3)) : Math.round(min))} / ${fmt(k, k==='CLS'? Number(max.toFixed(3)) : Math.round(max))}` : '—'}</TableCell>
                    <TableCell><Sparkline data={values.slice(-30)} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}
