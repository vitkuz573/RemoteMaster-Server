"use client"

import { Button } from '@/components/ui/button'
import { appConfig } from '@/lib/app-config'

export function SupportBundleButton() {
  const createBundle = async () => {
    const info: any = {
      app: {
        name: appConfig.name,
        version: appConfig.version,
        build: appConfig.buildInfo,
        branch: appConfig.buildBranch,
        date: appConfig.buildDate,
        environment: appConfig.environment,
      },
      endpoints: appConfig.endpoints,
      client: collectClient(),
      checks: await runChecks(),
      webVitals: readWebVitals(),
      performance: collectPerformance(),
      storage: await collectStorage(),
      layout: readLayoutSnapshot(),
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `support-bundle-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  return <Button variant="outline" onClick={createBundle}>Download support bundle</Button>
}

function collectClient() {
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
    cpuCores: n.hardwareConcurrency ?? null,
    memoryGB: n.deviceMemory ?? null,
    colorScheme: (w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
    reducedMotion: (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'reduce' : 'no-preference',
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
    // Storage quotas
    const est = await (navigator as any).storage?.estimate?.()
    return { quota: est?.quota, usage: est?.usage }
  } catch { return null }
}

function readLayoutSnapshot() {
  // Persisted About layout settings (order/hidden/sizes) across scopes
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

async function runChecks() {
  const out: Record<string, any> = {}
  const list: Array<{ name: string; url?: string; method: 'GET'|'HEAD' }> = [
    { name: 'API', url: appConfig.endpoints.api, method: 'HEAD' },
    { name: 'Health', url: appConfig.endpoints.health, method: 'GET' },
    { name: 'Status', url: appConfig.endpoints.status, method: 'GET' },
  ]
  for (const c of list) {
    if (!c.url) { out[c.name] = { status: 'unknown' }; continue }
    const start = performance.now()
    try {
      const res = await fetch(c.url, { method: c.method, cache: 'no-store' })
      out[c.name] = { status: res.ok ? 'ok' : 'fail', code: res.status, ms: Math.round(performance.now() - start) }
    } catch (e) {
      out[c.name] = { status: 'fail', error: e instanceof Error ? e.message : String(e), ms: Math.round(performance.now() - start) }
    }
  }
  return out
}
