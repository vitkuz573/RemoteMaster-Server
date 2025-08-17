"use client"

export type IssueTemplate = 'support' | 'bug' | 'feature'
export type Payload = Record<string, unknown>

const mdEsc = (s: string) => s.replace(/[<>]/g, (m) => ({ '<': '&lt;', '>': '&gt;' }[m] as string))
const details = (title: string, content: string) => `<details><summary>${mdEsc(title)}</summary>\n\n${content}\n\n</details>`
const code = (lang: string, content: string) => `\n\n\x60\x60\x60${lang}\n${content}\n\x60\x60\x60\n\n`

export function buildIssueTitle(p: Payload, tmpl: IssueTemplate): string {
  const name = typeof p['name'] === 'string' ? p['name'] : 'App'
  const version = typeof p['version'] === 'string' ? p['version'] : ''
  const env = typeof p['environment'] === 'string' ? p['environment'] : ''
  const prefix = tmpl === 'bug' ? '[Bug]' : tmpl === 'feature' ? '[Feature]' : '[Support]'
  const bits = [name, version && `v${version}`, env && `(${env})`].filter(Boolean)
  return `${prefix} ${bits.join(' ')} — <replace with 1-line summary>`
}

export function buildIssueBody(p: Payload, opts?: { includeEnv?: boolean; includeEndpoints?: boolean; includeDiagnostics?: boolean; extra?: string; template?: IssueTemplate }) {
  const tmpl = opts?.template ?? 'support'
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const lang = typeof navigator !== 'undefined' ? navigator.language : ''
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : ''

  const endpoints = (p['endpoints'] || {}) as Record<string, string | undefined>
  const epList = Object.entries(endpoints)
    .filter(([, v]) => typeof v === 'string' && v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  const headerLines = (
    tmpl === 'bug'
      ? [
          '- Summary: <one-line description>',
          '- Steps to Reproduce: <1..N>',
          '- Expected Result: <...>',
          '- Actual Result: <...>',
          '- Screenshots/Logs: <attach if possible>',
        ]
      : tmpl === 'feature'
      ? [
          '- Summary: <short description>',
          '- Motivation: <why is this needed?>',
          '- Proposal: <what should change?>',
          '- Alternatives: <considered alternatives>',
        ]
      : [
          '- Summary: <one-line description>',
          '- Context: <where/how it happens>',
          '- Screenshots/Logs: <attach if possible>',
        ]
  ).join('\n')

  const envBlock = `- Name: ${p['name'] ?? '—'}\n`+
    `- Version: v${p['version'] ?? '—'}\n`+
    `- Build: ${p['build'] ?? p['buildInfo'] ?? '—'}\n`+
    `- Branch: ${p['branch'] ?? p['buildBranch'] ?? '—'}\n`+
    `- Date: ${p['date'] ?? p['buildDate'] ?? '—'}\n`+
    `- Environment: ${p['environment'] ?? '—'}\n`+
    `- Client: ${ua || '—'}\n`+
    `- Locale/Timezone: ${lang || '—'} / ${tz || '—'}\n`+
    `- Viewport: ${viewport || '—'}\n`

  const parts: string[] = [headerLines]
  if (opts?.extra) parts.push(opts.extra)
  if (opts?.includeEnv !== false) parts.push(details('Environment', envBlock))
  if (opts?.includeEndpoints !== false && epList) parts.push(details('Endpoints', epList))
  if (opts?.includeDiagnostics !== false) parts.push(details('Diagnostics payload', code('json', JSON.stringify(p, null, 2))))
  return parts.filter(Boolean).join('\n\n')
}

export function buildIssueUrl(repo: { type?: string | null; url?: string | null }, params: { title: string; body: string; labels?: string[] }) {
  const url = repo.url || ''
  const type = (repo.type || 'github').toLowerCase()
  if (type === 'gitlab') {
    const sp = new URLSearchParams()
    sp.set('issue[title]', params.title)
    sp.set('issue[description]', params.body)
    if (params.labels?.length) sp.set('issue[labels]', params.labels.join(','))
    return `${url}/-/issues/new?${sp.toString()}`
  }
  if (type === 'bitbucket') {
    const sp = new URLSearchParams()
    sp.set('title', params.title)
    sp.set('content', params.body)
    return `${url}/issues/new?${sp.toString()}`
  }
  // default: GitHub
  const sp = new URLSearchParams()
  sp.set('title', params.title)
  sp.set('body', params.body)
  if (params.labels?.length) sp.set('labels', params.labels.join(','))
  return `${url}/issues/new?${sp.toString()}`
}

