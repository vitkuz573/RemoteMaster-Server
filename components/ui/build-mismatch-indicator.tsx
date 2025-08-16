"use client"

import { useEffect, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'

type Info = { version?: string; buildHash?: string } | null

export function BuildMismatchIndicator() {
  const [server, setServer] = useState<Info>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/build-info', { cache: 'no-store' })
      .then(r => r.json())
      .then((d) => { if (alive) setServer({ version: d?.version, buildHash: d?.buildHash }) })
      .catch(() => { if (alive) setServer(null) })
    return () => { alive = false }
  }, [])

  if (!server) return null
  const mismatch = server.version !== appConfig.version || server.buildHash !== appConfig.buildHash
  if (!mismatch) return null
  return <Badge variant="destructive">Mismatch</Badge>
}

