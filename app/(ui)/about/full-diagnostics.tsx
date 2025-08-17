"use client"

import { useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { readWebVitalsHist, collectPerformanceSummary, collectStorageEstimate } from './diagnostics-utils'

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

async function getBuildInfo(): Promise<any> {
  try { const r = await fetch('/api/build-info', { cache: 'no-store' }); return await r.json() } catch { return null }
}

async function getConfigLint(): Promise<any> {
  try { const r = await fetch('/api/config-lint', { cache: 'no-store' }); return await r.json() } catch { return null }
}

export function FullDiagnostics() {
  const t = useTranslations('common')
  const [busy, setBusy] = useState(false)

  const run = async (openIssue: boolean) => {
    setBusy(true)
    try {
      const [status, time, build, lint] = await Promise.all([
        runStatusChecks(),
        runTimeSync(),
        getBuildInfo(),
        getConfigLint()
      ])
      const payload = {
        app: {
          name: appConfig.name,
          version: appConfig.version,
          buildHash: appConfig.buildHash,
          buildDate: appConfig.buildDate,
          buildBranch: appConfig.buildBranch,
          environment: appConfig.environment,
        },
        endpoints: appConfig.endpoints,
        status,
        time,
        buildInfo: build,
        configReport: lint,
        client: collectClientEnv(),
        webVitals: readWebVitalsHist(),
        performance: collectPerformanceSummary(),
        storage: await collectStorageEstimate(),
        timestamp: new Date().toISOString(),
      }
      if (openIssue && appConfig.repository.url) {
        const pretty = '```json\n' + JSON.stringify(payload, null, 2) + '\n```' // keep formatting
        const build = (b: string) => `${appConfig.repository.url}/issues/new?title=${encodeURIComponent('[Support] Full diagnostics')}&body=${encodeURIComponent(b)}`
        let url = build(pretty)
        if (url.length > 7000) {
          const notice = '_Body is long. Full diagnostics copied to clipboard — paste below and attach file if possible._'
          try { void navigator.clipboard?.writeText(pretty) } catch {}
          url = build(notice)
        }
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'full-diagnostics.json'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }
    } finally { setBusy(false) }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button size="sm" variant="outline" onClick={() => run(false)} disabled={busy}>{t('export_full_diagnostics')}</Button>
      <Button size="sm" variant="outline" onClick={() => run(true)} disabled={busy}>{t('open_issue_diagnostics')}</Button>
    </div>
  )
}
