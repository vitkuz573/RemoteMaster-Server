"use client"

import { Button } from '@/components/ui/button'

export function OpenIssueDiagnostics({repoUrl, payload}:{repoUrl?: string; payload: Record<string, unknown>}) {
  if (!repoUrl) return null
  const onClick = () => {
    try {
      const pretty = '```json\n' + JSON.stringify(payload, null, 2) + '\n```'
      const compact = '```json\n' + JSON.stringify(payload) + '\n```'
      const build = (b: string) => `${repoUrl}/issues/new?title=${encodeURIComponent('[Support] Diagnostics package')}&body=${encodeURIComponent(b)}`
      let url = build(compact)
      // Fallbacks for long URLs: copy body to clipboard and use short notice
      if (url.length > 7000) {
        const notice = '_Body is long. Full JSON copied to clipboard — paste below and attach file if possible._\n\n' + pretty
        try { void navigator.clipboard?.writeText(pretty) } catch {}
        url = build(notice)
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return <Button variant="outline" size="sm" onClick={onClick}>Open issue with diagnostics</Button>
}
