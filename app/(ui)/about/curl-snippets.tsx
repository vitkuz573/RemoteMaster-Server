"use client"

import { useMemo } from 'react'
import { appConfig } from '@/lib/app-config'
import { Button } from '@/components/ui/button'

function CopyButton({ text }: { text: string }) {
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {}
  }
  return (
    <Button variant="outline" size="sm" onClick={onCopy}>Copy</Button>
  )
}

export function CurlSnippets() {
  const cmds = useMemo(() => {
    const api = appConfig.endpoints.api
    const health = appConfig.endpoints.health
    const status = appConfig.endpoints.status
    return [
      api ? { label: 'API HEAD', cmd: `curl -I ${api}` } : null,
      api ? { label: 'API timing', cmd: `curl -s -o /dev/null -w "HTTP:%{http_code} TIME_TOTAL:%{time_total}s" ${api}` } : null,
      health ? { label: 'Health GET', cmd: `curl -s ${health}` } : null,
      status ? { label: 'Status GET', cmd: `curl -s ${status}` } : null,
    ].filter(Boolean) as {label:string;cmd:string}[]
  }, [])

  if (cmds.length === 0) return null
  return (
    <div className="space-y-3">
      {cmds.map((c) => (
        <div key={c.label} className="rounded-md border p-3">
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>{c.label}</span>
            <CopyButton text={c.cmd} />
          </div>
          <pre className="text-xs overflow-x-auto"><code>{c.cmd}</code></pre>
        </div>
      ))}
    </div>
  )
}

