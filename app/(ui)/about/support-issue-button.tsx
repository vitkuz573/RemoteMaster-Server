"use client"

import { Button } from '@/components/ui/button'
import { buildIssueBody, buildIssueTitle, buildIssueUrl } from './support-issue-utils'

export function SupportIssueButton({ repoUrl, payload }: { repoUrl: string; payload: Record<string, unknown> }) {
  const openIssue = () => {
    try {
      const title = buildIssueTitle(payload, 'support')
      const body = buildIssueBody(payload, { template: 'support' })
      const url = buildIssueUrl({ type: 'github', url: repoUrl }, { title, body, labels: ['support'] })
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return (
    <Button variant="outline" onClick={openIssue}>Open support issue</Button>
  )
}
