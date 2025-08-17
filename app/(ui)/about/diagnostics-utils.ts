"use client"

// Shared client-side diagnostics helpers for About page widgets

export function readWebVitalsHist(): Record<string, any> {
  try { return JSON.parse(sessionStorage.getItem('about:webvitals:hist') || '{}') } catch { return {} }
}

export function collectPerformanceSummary() {
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

export async function collectStorageEstimate() {
  try { const est = await (navigator as any).storage?.estimate?.(); return { quota: est?.quota, usage: est?.usage } } catch { return null }
}

export function readLayoutSnapshot() {
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

export function maskUrl(u?: string | null) {
  if (!u) return u
  try { const x = new URL(u); return `${x.origin}${x.pathname}` } catch { return u }
}

