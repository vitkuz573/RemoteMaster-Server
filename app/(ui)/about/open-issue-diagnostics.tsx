"use client"

import { Button } from '@/components/ui/button'

export function OpenIssueDiagnostics({repoUrl, payload}:{repoUrl?: string; payload: Record<string, unknown>}) {
  if (!repoUrl) return null
  const onClick = () => {
    try {
      const pretty = '```json\n' + JSON.stringify(payload, null, 2) + '\n```' // keep formatting
      const build = (b: string) => `${repoUrl}/issues/new?title=${encodeURIComponent('[Support] Diagnostics package')}&body=${encodeURIComponent(b)}`
      let url = build(pretty)
      // If too long, copy pretty JSON and open short notice
      if (url.length > 7000) {
        const notice = '_Body is long. Full JSON copied to clipboard — paste below and attach file if possible._'
        try { void navigator.clipboard?.writeText(pretty) } catch {}
        url = build(notice)
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return <Button variant="outline" size="sm" onClick={onClick}>Open issue with diagnostics</Button>
}
