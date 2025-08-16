"use client"

import { useEffect, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'

type BuildInfo = {
  name: string
  version: string
  buildHash: string
  buildDate: string
  buildBranch: string
  environment: string
}

export function BuildInfoCompare() {
  const [server, setServer] = useState<BuildInfo | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/api/build-info', { cache: 'no-store' })
      .then(r => r.json())
      .then((d) => { if (alive) setServer(d) })
      .catch(() => { if (alive) setServer(null) })
    return () => { alive = false }
  }, [])

  if (!server) return null
  const client = { version: appConfig.version, buildHash: appConfig.buildHash, buildDate: appConfig.buildDate, buildBranch: appConfig.buildBranch }
  const mismatch = server.version !== client.version || server.buildHash !== client.buildHash
  return (
    <div className="text-xs space-y-1">
      <div>
        <span className="text-muted-foreground">Server:</span>{' '}
        <span className="font-mono">{server.version}@{server.buildHash.slice(0,7)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Client:</span>{' '}
        <span className="font-mono">{client.version}@{client.buildHash.slice(0,7)}</span>
      </div>
      <div>
        <Badge variant={mismatch ? 'destructive' : 'default'}>
          {mismatch ? 'Mismatch' : 'Match'}
        </Badge>
      </div>
    </div>
  )
}

