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

