"use client"

import { useEffect, useMemo, useState } from 'react'

type Row = { label: string; value: string }

export function ClientEnvironment() {
  const [rows, setRows] = useState<Row[]>([])

  const compute = useMemo(() => () => {
    const n = navigator as any
    const w = window as any
    const ua = n.userAgent
    const lang = n.language
    const langs = Array.isArray(n.languages) ? n.languages.join(', ') : ''
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const dpr = String(window.devicePixelRatio || 1)
    const wh = `${window.innerWidth}×${window.innerHeight}`
    const sh = `${screen.width}×${screen.height}`
    const online = String(n.onLine)
    const conn = n.connection ? `${n.connection.effectiveType || 'unknown'}${n.connection.saveData ? ' • saveData' : ''}` : 'unknown'
    const down = n.connection?.downlink ? `${n.connection.downlink}Mbps` : '—'
    const cores = (n.hardwareConcurrency ? String(n.hardwareConcurrency) : 'unknown')
    const mem = (n.deviceMemory ? `${n.deviceMemory}GB` : 'unknown')
    const color = w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const motion = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'

    const rows: Row[] = [
      { label: 'User agent', value: ua },
      { label: 'Language', value: lang },
      { label: 'Languages', value: langs },
      { label: 'Timezone', value: tz },
      { label: 'Viewport', value: wh },
      { label: 'Screen', value: sh },
      { label: 'Pixel ratio', value: dpr },
      { label: 'Online', value: online },
      { label: 'Connection', value: conn },
      { label: 'Downlink', value: down },
      { label: 'CPU cores', value: cores },
      { label: 'Memory', value: mem },
      { label: 'Color scheme', value: color },
      { label: 'Reduced motion', value: motion },
    ]
    return rows
  }, [])

  useEffect(() => { setRows(compute()) }, [compute])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="text-xs text-muted-foreground">{r.label}</div>
          <div className="font-mono text-xs break-all">{r.value}</div>
        </div>
      ))}
    </div>
  )
}

