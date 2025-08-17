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

import { env } from '@/lib/env'

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
          '- [ ] Summary: <one-line description>',
          '1. <Step one>',
          '2. <Step two>',
          '- [ ] Expected: <...>',
          '- [ ] Actual: <...>',
          '- [ ] Attach screenshots/logs if possible',
        ]
      : tmpl === 'feature'
      ? [
          '- [ ] Summary: <short description>',
          '- [ ] Motivation: <why is this needed?>',
          '- [ ] Proposal: <what should change?>',
          '- [ ] Alternatives: <considered alternatives>',
        ]
      : [
          '- [ ] Summary: <one-line description>',
          '- [ ] Context: <where/how it happens>',
          '- [ ] Attach screenshots/logs if possible',
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
  const diagTrimmed = (diagJson === '{}' ? '' : (diagJson.length > maxDiag ? diagJson.slice(0, maxDiag) + '\n…(truncated)…' : diagJson))

  // Feature flags / operational toggles tables (from env)
  const ff = Object.entries(env as Record<string, any>).filter(([k]) => k.startsWith('NEXT_PUBLIC_FEATURE_'))
  const toggles = Object.entries(env as Record<string, any>).filter(([k]) => k.startsWith('NEXT_PUBLIC_') && !k.startsWith('NEXT_PUBLIC_FEATURE_') && /ENABLE(D)?/i.test(k))
  const flagsTable = ff.length ? table(['Flag','Value'], ff.map(([k,v]) => [k.replace('NEXT_PUBLIC_FEATURE_',''), String(v)])) : ''
  const togglesTable = toggles.length ? table(['Toggle','Value'], toggles.map(([k,v]) => [k.replace('NEXT_PUBLIC_',''), String(v)])) : ''

  const parts: string[] = []
  parts.push('# Issue\n\n' + headerLines)
  if (opts?.extra) parts.push('\n## Additional Context\n\n' + opts.extra)
  if (opts?.includeEnv !== false) parts.push('\n## Environment\n\n' + envTable)
  if (opts?.includeEndpoints !== false && endpointsTable) parts.push('\n## 🔗 Endpoints\n\n' + endpointsTable)
  if (opts?.includeEndpoints !== false && lastTable) parts.push('\n## Endpoints Snapshot\n\n' + lastTable)
  if (flagsTable) parts.push('\n## 🧩 Feature Flags\n\n' + flagsTable)
  if (togglesTable) parts.push('\n## ⚙️ Operational Toggles\n\n' + togglesTable)
  if (opts?.includeDiagnostics !== false) parts.push('\n## 🧾 Diagnostics\n' + (diagTrimmed ? code('json', diagTrimmed) : '_No diagnostics payload_'))
  parts.push('\n> Attach screenshots or full logs if available.')
  return parts.filter(Boolean).join('\n')
}

// Minimal Markdown -> HTML renderer for preview (headings, lists, code, tables, links, bold/italic, inline code)
export function mdToHtml(md: string): string {
  // Escape HTML, keep code fences separately
  const fenceRe = /```([a-zA-Z0-9]*)\n[\s\S]*?```/g
  const fences: string[] = []
  md = md.replace(fenceRe, (m) => { fences.push(m); return `__CODE_BLOCK_${fences.length-1}__` })
  let html = mdEsc(md)
  // Headings
  html = html.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s?(.*)$/gm, '<h1>$1</h1>')
  // Task lists
  html = html.replace(/^\- \[ \] (.*)$/gm, '<div class="task"><input type="checkbox" disabled> $1</div>')
  html = html.replace(/^\- \[x\] (.*)$/gmi, '<div class="task"><input type="checkbox" checked disabled> $1</div>')
  // Ordered lists
  html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<div class="ol">$1. $2</div>')
  // Unordered lists
  html = html.replace(/^\-\s+(.*)$/gm, '<div class="ul">• $1</div>')
  // Bold/italic/inline code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
  // Tables (simple)
  html = html.replace(/\n\|([^\n]+)\|\n\|([\s\|\-:]+)\|\n([\s\S]*?)\n(?=\n|$)/g, (m, head, sep, body) => {
    const th = head.split('|').map((s: string) => s.trim()).filter(Boolean).map((c: string) => `<th>${c}</th>`).join('')
    const rows = body.trim().split('\n').map((row: string) => `<tr>${row.split('|').filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join('')}</tr>`).join('')
    return `\n<table class="md-table"><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table>\n`
  })
  // Paragraphs
  html = html.replace(/^(?!<(h\d|div|table|pre|ul|ol|li|blockquote|hr)).+$/gm, '<p>$&</p>')
  // Restore code fences
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_m, i) => {
    const block = fences[Number(i)]
    const lang = (block.match(/```([a-zA-Z0-9]*)\n/) || [,''])[1]
    const content = block.replace(/```[a-zA-Z0-9]*\n|```/g, '')
    return `<pre class="code"><code class="lang-${lang}">${mdEsc(content)}</code></pre>`
  })
  return `<style>
    .md h1{font-size:1.25rem;margin:.75rem 0}.md h2{font-size:1.1rem;margin:.6rem 0}.md h3{font-size:1rem;margin:.5rem 0}
    .md p{margin:.4rem 0;line-height:1.4}.md code{background:var(--muted);padding:.1rem .25rem;border-radius:4px}
    .md .md-table{width:100%;border-collapse:collapse;margin:.5rem 0}.md .md-table th,.md .md-table td{border:1px solid var(--border);padding:.25rem .4rem;font-size:.85em}
    .md .task{margin:.2rem 0}.md .code{background:var(--muted);padding:.5rem;border-radius:6px;overflow:auto}
  </style><div class="md">${html}</div>`
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
