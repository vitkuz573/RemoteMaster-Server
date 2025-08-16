"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Result = { offsetMs: number; rttMs: number } | null

export function TimeSync() {
  const [res, setRes] = useState<Result>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const t0 = performance.now()
      const start = Date.now()
      const r = await fetch('/api/time', { cache: 'no-store' })
      const t1 = performance.now()
      const { serverTime } = await r.json()
      const server = new Date(serverTime).getTime()
      const client = start
      const rtt = Math.round(t1 - t0)
      const offset = Math.round(server - (client + rtt / 2)) // NTP-like midpoint
      setRes({ offsetMs: offset, rttMs: rtt })
    } catch {
      setRes(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void run() }, [])

  const variant = !res ? 'outline' : Math.abs(res.offsetMs) < 1000 ? 'default' : Math.abs(res.offsetMs) < 5000 ? 'secondary' : 'destructive'

  return (
    <div className="flex items-center gap-3">
      <Badge variant={variant as any}>
        {res ? `offset ${res.offsetMs} ms • rtt ${res.rttMs} ms` : 'unknown'}
      </Badge>
      <Button size="sm" variant="outline" onClick={run} disabled={loading}>
        {loading ? 'Measuring…' : 'Re-check'}
      </Button>
    </div>
  )
}

