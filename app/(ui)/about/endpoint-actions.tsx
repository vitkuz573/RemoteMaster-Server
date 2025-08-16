"use client"

import { Button } from '@/components/ui/button'

export function EndpointActions({ url }: { url?: string }) {
  if (!url) return null
  const copy = async () => { try { await navigator.clipboard.writeText(url) } catch {} }
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer noopener">Open</a></Button>
      <Button size="sm" variant="outline" onClick={copy}>Copy</Button>
    </div>
  )
}

