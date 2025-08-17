"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { appConfig } from '@/lib/app-config'

type Check = { name: string; url?: string; method?: 'GET'|'HEAD' }

async function runStatusChecks(): Promise<any> {
  const checks: Check[] = [
    { name: 'API', url: appConfig.endpoints.api, method: 'HEAD' },
    { name: 'Health', url: appConfig.endpoints.health, method: 'GET' },
    { name: 'Status', url: appConfig.endpoints.status, method: 'GET' },
  ]
  const results: any[] = []
  for (const c of checks) {
    const start = performance.now()
    try {
      if (!c.url) { results.push({ name: c.name, ok: false }); continue }
      const res = await fetch(c.url, { method: c.method ?? 'GET', cache: 'no-store' })
      const ms = Math.round(performance.now() - start)
      results.push({ name: c.name, ok: res.ok, code: res.status, ms, url: c.url })
    } catch {
      const ms = Math.round(performance.now() - start)
      results.push({ name: c.name, ok: false, ms, url: c.url })
    }
  }
  return { results, generatedAt: new Date().toISOString() }
}

async function runTimeSync(): Promise<any> {
  const t0 = performance.now()
  const start = Date.now()
  const r = await fetch('/api/time', { cache: 'no-store' })
  const t1 = performance.now()
  const { serverTime } = await r.json()
  const server = new Date(serverTime).getTime()
  const client = start
  const rtt = Math.round(t1 - t0)
  const offset = Math.round(server - (client + rtt / 2))
  return { offsetMs: offset, rttMs: rtt }
}

async function getBuildInfo(): Promise<any> {
  try { const r = await fetch('/api/build-info', { cache: 'no-store' }); return await r.json() } catch { return null }
}
async function getConfigLint(): Promise<any> {
  try { const r = await fetch('/api/config-lint', { cache: 'no-store' }); return await r.json() } catch { return null }
}

function collectClientEnv() {
  const n: any = navigator
  const w: any = window
  return {
    userAgent: n.userAgent,
    language: n.language,
    languages: n.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${screen.width}x${screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    online: n.onLine,
    connection: n.connection ? { effectiveType: n.connection.effectiveType, saveData: n.connection.saveData, downlink: n.connection.downlink } : null,
  }
}

function readWebVitals() {
  try { return JSON.parse(sessionStorage.getItem('about:webvitals:hist') || '{}') } catch { return {} }
}

function collectPerformance() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const paints = performance.getEntriesByType('paint') as PerformanceEntry[]
  const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const summary: any = {}
  if (nav) {
    summary.navigation = {
      type: (nav as any).type,
      startTime: nav.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadEvent: nav.loadEventEnd - nav.startTime,
      responseEnd: nav.responseEnd - nav.startTime,
      transferSize: (nav as any).transferSize,
      encodedBodySize: (nav as any).encodedBodySize,
      decodedBodySize: (nav as any).decodedBodySize,
    }
  }
  if (paints && paints.length) {
    summary.paint = Object.fromEntries(paints.map((p: any) => [p.name, Math.round(p.startTime)]))
  }
  if (res && res.length) {
    const byType: Record<string, number> = {}
    for (const r of res.slice(-200)) {
      const ext = (r.name.split('?')[0].split('.').pop() || 'other').toLowerCase()
      byType[ext] = (byType[ext] || 0) + 1
    }
    summary.resources = { count: res.length, recentByExt: byType }
  }
  const mem = (performance as any).memory
  if (mem) summary.memory = { jsHeapSizeLimit: mem.jsHeapSizeLimit, totalJSHeapSize: mem.totalJSHeapSize, usedJSHeapSize: mem.usedJSHeapSize }
  return summary
}

async function collectStorage() {
  try {
    const est = await (navigator as any).storage?.estimate?.()
    return { quota: est?.quota, usage: est?.usage }
  } catch { return null }
}

function readLayoutSnapshot() {
  const scopes = Array.from(document.querySelectorAll<HTMLElement>('[data-cards-scope]')).map((el) => el.getAttribute('data-cards-scope') || 'default')
  const out: Record<string, any> = {}
  for (const id of scopes) {
    try {
      const order = JSON.parse(localStorage.getItem(`about:order:${id}`) || 'null')
      const hidden = JSON.parse(localStorage.getItem(`about:hidden:${id}`) || '[]')
      const sizes = JSON.parse(localStorage.getItem(`about:size:${id}`) || '{}')
      out[id] = { order, hidden, sizes }
    } catch {}
  }
  return out
}

function maskEmail(s?: string | null) {
  if (!s) return s
  const [user, domain] = s.split('@')
  if (!domain) return s
  const masked = user.length > 2 ? user[0] + '***' + user[user.length - 1] : '***'
  return `${masked}@${domain}`
}
function maskPhone(s?: string | null) {
  if (!s) return s
  return s.replace(/\d(?=\d{2})/g, '•')
}
function maskUrl(u?: string | null) {
  if (!u) return u
  try { const x = new URL(u); return `${x.origin}${x.pathname}` } catch { return u }
}

export function SupportBundlePanel() {
  // Toggles
  const [includeStatus, setIncludeStatus] = useState(true)
  const [includeTime, setIncludeTime] = useState(true)
  const [includeBuild, setIncludeBuild] = useState(true)
  const [includeLint, setIncludeLint] = useState(true)
  const [includeClient, setIncludeClient] = useState(true)
  const [includeVitals, setIncludeVitals] = useState(true)
  const [includePerf, setIncludePerf] = useState(true)
  const [includeStorage, setIncludeStorage] = useState(true)
  const [includeLayout, setIncludeLayout] = useState(true)
  const [includeEndpoints, setIncludeEndpoints] = useState(true)
  const [mask, setMask] = useState(true)
  const [busy, setBusy] = useState(false)

  const presets = useMemo(() => ({
    minimal: () => {
      setIncludeStatus(true); setIncludeTime(true); setIncludeBuild(true); setIncludeLint(false)
      setIncludeClient(true); setIncludeVitals(false); setIncludePerf(false); setIncludeStorage(false); setIncludeLayout(false); setIncludeEndpoints(true)
    },
    full: () => {
      setIncludeStatus(true); setIncludeTime(true); setIncludeBuild(true); setIncludeLint(true)
      setIncludeClient(true); setIncludeVitals(true); setIncludePerf(true); setIncludeStorage(true); setIncludeLayout(true); setIncludeEndpoints(true)
    }
  }), [])

  const buildPayload = async () => {
    const [status, time, build, lint, storage] = await Promise.all([
      includeStatus ? runStatusChecks() : Promise.resolve(undefined),
      includeTime ? runTimeSync() : Promise.resolve(undefined),
      includeBuild ? getBuildInfo() : Promise.resolve(undefined),
      includeLint ? getConfigLint() : Promise.resolve(undefined),
      includeStorage ? collectStorage() : Promise.resolve(undefined),
    ])
    const payload: any = {
      app: {
        name: appConfig.name,
        version: appConfig.version,
        buildHash: appConfig.buildHash,
        buildDate: appConfig.buildDate,
        buildBranch: appConfig.buildBranch,
        environment: appConfig.environment,
      },
      endpoints: includeEndpoints ? appConfig.endpoints : undefined,
      status,
      time,
      buildInfo: build,
      configReport: lint,
      client: includeClient ? collectClientEnv() : undefined,
      webVitals: includeVitals ? readWebVitals() : undefined,
      performance: includePerf ? collectPerformance() : undefined,
      storage,
      layout: includeLayout ? readLayoutSnapshot() : undefined,
      timestamp: new Date().toISOString(),
    }
    if (mask) {
      if (payload.endpoints) {
        payload.endpoints = Object.fromEntries(Object.entries(payload.endpoints).map(([k, v]: any) => [k, maskUrl(v as any)]))
      }
    }
    return payload
  }

  const downloadJson = async () => {
    setBusy(true)
    try {
      const payload = await buildPayload()
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `support-bundle-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally { setBusy(false) }
  }

  const summaryMd = async () => {
    const p = await buildPayload()
    const lines: string[] = []
    lines.push(`# Support Bundle Summary`)
    lines.push('')
    lines.push(`- App: ${p.app?.name} v${p.app?.version} (${p.app?.environment})`)
    if (p.buildInfo) lines.push(`- Build: ${p.app?.buildHash ?? p.buildInfo?.hash ?? p.buildInfo?.commit}`)
    if (p.time) lines.push(`- Time sync: offset ${p.time.offsetMs}ms (RTT ${p.time.rttMs}ms)`) 
    if (p.status?.results?.length) {
      lines.push('')
      lines.push('| Check | Code | ms | OK |')
      lines.push('| --- | --- | --- | --- |')
      for (const r of p.status.results) {
        lines.push(`| ${r.name} | ${r.code ?? '—'} | ${r.ms ?? '—'} | ${r.ok ? '✅' : '❌'} |`)
      }
    }
    if (p.endpoints) {
      lines.push('')
      lines.push('## Endpoints')
      for (const [k, v] of Object.entries(p.endpoints)) lines.push(`- ${k}: ${v || '—'}`)
    }
    lines.push('')
    lines.push('> Full details attached in JSON.')
    return lines.join('\n')
  }

  const downloadMd = async () => {
    setBusy(true)
    try {
      const md = await summaryMd()
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `support-bundle-${Date.now()}.md`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally { setBusy(false) }
  }

  const openIssue = async () => {
    setBusy(true)
    try {
      const md = await summaryMd()
      const body = md
      const build = (b: string) => `${appConfig.repository.url}/issues/new?title=${encodeURIComponent('[Support] Bundle')}&body=${encodeURIComponent(b)}`
      let url = build(body)
      if (url.length > 7000) {
        const payload = await buildPayload()
        const pretty = '```json\n' + JSON.stringify(payload, null, 2) + '\n```'
        const notice = '_Body is long. Summary and full JSON copied to clipboard — paste below and attach file if possible._\n\n' + md
        try { await navigator.clipboard?.writeText(pretty) } catch {}
        url = build(notice)
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally { setBusy(false) }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Preset</span>
        <Select onValueChange={(v) => { v==='minimal' ? presets.minimal() : presets.full() }}>
          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
        <label className="inline-flex items-center gap-2">
          <Checkbox checked={mask} onCheckedChange={(v)=>setMask(Boolean(v))} />
          <span className="text-xs">Mask sensitive</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeStatus} onCheckedChange={(v)=>setIncludeStatus(Boolean(v))} /> Status</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeTime} onCheckedChange={(v)=>setIncludeTime(Boolean(v))} /> Time sync</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeBuild} onCheckedChange={(v)=>setIncludeBuild(Boolean(v))} /> Build info</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeLint} onCheckedChange={(v)=>setIncludeLint(Boolean(v))} /> Config report</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeClient} onCheckedChange={(v)=>setIncludeClient(Boolean(v))} /> Client env</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeEndpoints} onCheckedChange={(v)=>setIncludeEndpoints(Boolean(v))} /> Endpoints</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeVitals} onCheckedChange={(v)=>setIncludeVitals(Boolean(v))} /> Web Vitals</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includePerf} onCheckedChange={(v)=>setIncludePerf(Boolean(v))} /> Performance</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeStorage} onCheckedChange={(v)=>setIncludeStorage(Boolean(v))} /> Storage</label>
        <label className="inline-flex items-center gap-2"><Checkbox checked={includeLayout} onCheckedChange={(v)=>setIncludeLayout(Boolean(v))} /> Layout</label>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" disabled={busy} onClick={downloadJson}>Download .json</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={downloadMd}>Download .md</Button>
        {appConfig.repository.url ? (
          <Button size="sm" onClick={openIssue} disabled={busy}>Open issue</Button>
        ) : null}
      </div>
    </div>
  )
}

