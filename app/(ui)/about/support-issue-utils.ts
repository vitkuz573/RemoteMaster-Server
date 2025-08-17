"use client"

export type IssueTemplate = 'support' | 'bug' | 'feature'
export type Payload = Record<string, unknown>

const mdEsc = (s: string) => s.replace(/[<>]/g, (m) => ({ '<': '&lt;', '>': '&gt;' }[m] as string))
const code = (lang: string, content: string) => `\n\n\x60\x60\x60${lang}\n${content}\n\x60\x60\x60\n\n`
const table = (headers: string[], rows: string[][]) => {
  const h = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((r) => `| ${r.map((c) => (c || '—').replace(/\n/g, ' ')).join(' | ')} |`).join('\n')
  return `${h}\n${sep}\n${body}`
}

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
  const epListArr = Object.entries(endpoints).filter(([, v]) => typeof v === 'string' && v)

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

  const envTable = table(
    ['Key', 'Value'],
    [
      ['Name', String(p['name'] ?? '—')],
      ['Version', `v${p['version'] ?? '—'}`],
      ['Build', String(p['build'] ?? p['buildInfo'] ?? '—')],
      ['Branch', String(p['branch'] ?? p['buildBranch'] ?? '—')],
      ['Date', String(p['date'] ?? p['buildDate'] ?? '—')],
      ['Environment', String(p['environment'] ?? '—')],
      ['Client', ua || '—'],
      ['Locale/Timezone', `${lang || '—'} / ${tz || '—'}`],
      ['Viewport', viewport || '—'],
    ]
  )

  // Layout snapshot from localStorage
  const scopes = Array.from(document.querySelectorAll<HTMLElement>('[data-cards-scope]'))
  const layout: Record<string, any> = {}
  for (const s of scopes) {
    const id = s.getAttribute('data-cards-scope') || 'default'
    try {
      const order = JSON.parse(localStorage.getItem(`about:order:${id}`) || 'null')
      const hidden = JSON.parse(localStorage.getItem(`about:hidden:${id}`) || '[]')
      const sizes = JSON.parse(localStorage.getItem(`about:size:${id}`) || '{}')
      layout[id] = { order, hidden, sizes }
    } catch {}
  }

  // Feature flags and operational toggles from env
  const envVars: Record<string, any> = (globalThis as any).__NEXT_DATA__ ? {} : {}
  // No direct access to env here reliably; panel will include them via payload if needed

  // Endpoint snapshots from sessionStorage
  const last: any[] = []
  try {
    for (const k in sessionStorage) {
      if (k.startsWith('about:endpoint:last:')) {
        try { last.push(JSON.parse(sessionStorage.getItem(k) || 'null')) } catch {}
      }
    }
  } catch {}

  const endpointsTable = epListArr.length
    ? table(
        ['Name', 'URL'],
        epListArr.map(([k, v]) => [k, String(v)])
      )
    : ''
  const lastTable = last.length
    ? table(
        ['Name', 'Method', 'Code', 'Latency (ms)', 'When'],
        last.map((r) => [String(r?.name||'—'), String(r?.method||'—'), String(r?.code ?? '—'), String(r?.ms ?? '—'), r?.ts ? new Date(r.ts).toISOString() : '—'])
      )
    : ''

  // Truncate diagnostics to keep URL size reasonable
  const diagJson = JSON.stringify(p, null, 2)
  const maxDiag = 4000
  const diagTrimmed = diagJson.length > maxDiag ? diagJson.slice(0, maxDiag) + '\n…(truncated)…' : diagJson

  const parts: string[] = []
  parts.push('# Issue\n\n' + headerLines)
  if (opts?.extra) parts.push('\n## Additional Context\n\n' + opts.extra)
  if (opts?.includeEnv !== false) parts.push('\n## Environment\n\n' + envTable)
  if (opts?.includeEndpoints !== false && endpointsTable) parts.push('\n## Endpoints\n\n' + endpointsTable)
  if (opts?.includeEndpoints !== false && lastTable) parts.push('\n## Endpoints Snapshot\n\n' + lastTable)
  if (opts?.includeDiagnostics !== false) parts.push('\n## Diagnostics\n' + code('json', diagTrimmed))
  parts.push('\n> Attach screenshots or full logs if available.')
  return parts.filter(Boolean).join('\n')
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
