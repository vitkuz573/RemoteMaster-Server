"use client"

import { Button } from '@/components/ui/button'

export function SupportIssueButton({ repoUrl, payload }: { repoUrl: string; payload: Record<string, unknown> }) {
  const openIssue = () => {
    try {
      const title = encodeURIComponent('[Support] Issue with RemoteMaster')
      const bodyObj = {
        description: 'Describe the problem here...',
        diagnostics: payload,
      }
      const body = encodeURIComponent('```json\n' + JSON.stringify(bodyObj, null, 2) + '\n```')
      const url = `${repoUrl}/issues/new?title=${title}&body=${body}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return (
    <Button variant="outline" onClick={openIssue}>Open support issue</Button>
  )
}

