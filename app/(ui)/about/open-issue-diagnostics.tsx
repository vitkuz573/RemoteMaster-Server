"use client"

import { Button } from '@/components/ui/button'

export function OpenIssueDiagnostics({repoUrl, payload}:{repoUrl?: string; payload: Record<string, unknown>}) {
  if (!repoUrl) return null
  const onClick = () => {
    try {
      const body = '```json\n' + JSON.stringify(payload, null, 2) + '\n```'
      const url = `${repoUrl}/issues/new?title=${encodeURIComponent('[Support] Diagnostics package')}&body=${encodeURIComponent(body)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return <Button variant="outline" size="sm" onClick={onClick}>Open issue with diagnostics</Button>
}

