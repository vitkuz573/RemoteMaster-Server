"use client"

import { useEffect, useState } from 'react'
import { appConfig } from '@/lib/app-config'

export function EndpointHeaders() {
  const [rows, setRows] = useState<{k:string;v:string}[] | null>(null)
  useEffect(() => {
    let alive = true
    const url = appConfig.endpoints.api
    if (!url) return
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then((r) => {
        const headers: {k:string;v:string}[] = []
        r.headers.forEach((v, k) => {
          if (['content-type','server','date','cache-control','x-powered-by'].includes(k.toLowerCase()))
            headers.push({ k, v })
        })
        if (alive) setRows(headers)
      })
      .catch(() => { if (alive) setRows(null) })
    return () => { alive = false }
  }, [])

  if (!rows) return null
  return (
    <div className="text-xs space-y-1">
      {rows.map((h) => (
        <div key={h.k} className="flex items-center justify-between">
          <span className="text-muted-foreground">{h.k}</span>
          <span className="font-mono">{h.v}</span>
        </div>
      ))}
    </div>
  )
}

