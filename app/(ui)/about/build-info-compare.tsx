"use client"

import { useEffect, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { CheckCircle2, XCircle } from 'lucide-react'

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
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {mismatch ? (
          <XCircle className="h-4 w-4 text-destructive" aria-hidden />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
        )}
        <span className="font-medium">
          {mismatch ? 'Server/Client mismatch' : 'Server/Client match'}
        </span>
        <span className="hidden sm:inline text-muted-foreground">•</span>
        <span className="text-muted-foreground">Server:</span>
        <span className="font-mono break-all">{server.version}@{server.buildHash.slice(0,7)}</span>
        <span className="text-muted-foreground">Client:</span>
        <span className="font-mono break-all">{client.version}@{client.buildHash.slice(0,7)}</span>
      </div>
    </div>
  )
}
