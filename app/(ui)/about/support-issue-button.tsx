"use client"

import { Button } from '@/components/ui/button'

type Payload = Record<string, unknown>

function mdEscape(s: string) {
  return s.replace(/[<>]/g, (m) => ({ '<': '&lt;', '>': '&gt;' }[m]!))
}

function buildIssueTitle(p: Payload) {
  const name = typeof p['name'] === 'string' ? p['name'] : 'App'
  const version = typeof p['version'] === 'string' ? p['version'] : ''
  const env = typeof p['environment'] === 'string' ? p['environment'] : ''
  const bits = [name, version && `v${version}`, env && `(${env})`].filter(Boolean)
  return `[Support] ${bits.join(' ')} — replace with brief summary`
}

function collapse(title: string, content: string) {
  return `<details><summary>${mdEscape(title)}</summary>\n\n${content}\n\n</details>`
}

function codeblock(lang: string, content: string) {
  return `\n\n\x60\x60\x60${lang}\n${content}\n\x60\x60\x60\n\n`
}

function buildIssueBody(p: Payload) {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const lang = typeof navigator !== 'undefined' ? navigator.language : ''
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new Date().toISOString()
  const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : ''

  const endpoints = p['endpoints'] as any
  const epList = endpoints
    ? Object.entries(endpoints as Record<string, string | undefined>)
        .filter(([, v]) => typeof v === 'string' && v)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : ''

  const header = `Please replace fields below with helpful info.\n\n` +
`- Summary: <one-line description>\n- Steps to Reproduce: <1..N>\n- Expected Result: <...>\n- Actual Result: <...>\n- Screenshots/Logs: <attach if possible>\n`

  const envBlock = `- Name: ${p['name'] ?? '—'}\n`+
`- Version: v${p['version'] ?? '—'}\n`+
`- Build: ${p['build'] ?? p['buildInfo'] ?? '—'}\n`+
`- Branch: ${p['branch'] ?? p['buildBranch'] ?? '—'}\n`+
`- Date: ${p['date'] ?? p['buildDate'] ?? '—'}\n`+
`- Environment: ${p['environment'] ?? '—'}\n`+
`- Client: ${ua || '—'}\n`+
`- Locale/Timezone: ${lang || '—'} / ${tz || '—'}\n`+
`- Viewport: ${viewport || '—'}\n`

  const endpointsBlock = epList ? `\nEndpoints:\n${epList}\n` : ''

  const diagnostics = codeblock('json', JSON.stringify(p, null, 2))

  const body = [
    header,
    collapse('Environment', envBlock),
    endpointsBlock ? collapse('Endpoints', endpointsBlock) : '',
    collapse('Diagnostics payload', diagnostics),
  ].filter(Boolean).join('\n')

  return body
}

export function SupportIssueButton({ repoUrl, payload }: { repoUrl: string; payload: Payload }) {
  const openIssue = () => {
    try {
      const title = encodeURIComponent(buildIssueTitle(payload))
      const body = encodeURIComponent(buildIssueBody(payload))
      // Try to add a support label if platform is GitHub
      const params = new URLSearchParams({ title, body })
      params.set('labels', 'support')
      const url = `${repoUrl}/issues/new?${params.toString()}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {}
  }
  return (
    <Button variant="outline" onClick={openIssue}>Open support issue</Button>
  )
}
