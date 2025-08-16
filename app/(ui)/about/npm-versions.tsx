"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type PkgMap = Record<string, string>

type PkgResponse = {
  name?: string
  version?: string
  engines?: { node?: string }
  dependencies?: PkgMap
  devDependencies?: PkgMap
}

type Row = {
  name: string
  current: string
  latest?: string
  group: 'dep' | 'dev'
  diff?: 'major' | 'minor' | 'patch' | 'same' | 'unknown'
}

const interesting = ['next', 'react', 'next-intl', 'typescript', 'eslint', 'tailwindcss']

function cleanVersion(input?: string) {
  if (!input) return undefined
  const s = input.trim().replace(/^\s*[~^><=]*\s*/, '').replace(/^v/, '')
  // Take first variant in complex ranges like ">=1.2.3 <2"
  const first = s.split(' ').shift() || s
  return first
}

function parseSemver(v?: string): [number, number, number] | null {
  if (!v) return null
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function diffType(current?: string, latest?: string): Row['diff'] {
  const c = parseSemver(cleanVersion(current))
  const l = parseSemver(cleanVersion(latest))
  if (!c || !l) return 'unknown'
  if (c[0] === l[0] && c[1] === l[1] && c[2] === l[2]) return 'same'
  if (l[0] > c[0]) return 'major'
  if (l[0] === c[0] && l[1] > c[1]) return 'minor'
  if (l[0] === c[0] && l[1] === c[1] && l[2] > c[2]) return 'patch'
  return 'unknown'
}

export function NpmVersions() {
  const [data, setData] = useState<PkgResponse | null>(null)
  const [latest, setLatest] = useState<Record<string, string | undefined>>({})
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [includeDev, setIncludeDev] = useState(false)
  const [query, setQuery] = useState('')
  const [onlyOutdated, setOnlyOutdated] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/api/package-json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: PkgResponse) => {
        if (alive) setData(j)
      })
      .catch(() => {
        if (alive) setError('failed')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    async function run() {
      if (!data) return
      const deps: PkgMap = { ...(data.dependencies || {}) }
      const devs: PkgMap = { ...(data.devDependencies || {}) }
      const pick = (names: string[]) => names.filter(Boolean)
      // Start with interesting set (fast), then optionally all
      const base = Object.keys(deps).filter((n) => interesting.includes(n))
      const additions = includeDev ? Object.keys(devs).filter((n) => interesting.includes(n)) : []
      const core = pick([...base, ...additions])

      const all = pick([
        ...Object.keys(deps),
        ...(includeDev ? Object.keys(devs) : []),
      ])

      const names = showAll ? all : core
      if (!names.length) return

      // Chunk to avoid overly long URLs
      const chunkSize = 40
      const entries: Array<[string, string | undefined]> = []
      for (let i = 0; i < names.length; i += chunkSize) {
        const chunk = names.slice(i, i + chunkSize)
        // eslint-disable-next-line no-await-in-loop
        const r = await fetch(`/api/npm/bulk?names=${encodeURIComponent(chunk.join(','))}`, { cache: 'no-store' })
        if (!r.ok) continue
        // eslint-disable-next-line no-await-in-loop
        const j = (await r.json()) as Record<string, string>
        entries.push(...Object.entries(j))
      }
      if (alive) setLatest(Object.fromEntries(entries))
    }
    run()
    return () => {
      alive = false
    }
  }, [data, showAll, includeDev])

  const rows: Row[] = useMemo(() => {
    if (!data) return []
    const deps: PkgMap = { ...(data.dependencies || {}) }
    const devs: PkgMap = { ...(data.devDependencies || {}) }

    const makeRows = (map: PkgMap, group: Row['group']): Row[] =>
      Object.entries(map).map(([name, current]) => ({ name, current, latest: latest[name], group, diff: diffType(current, latest[name]) }))

    let allRows: Row[] = []
    if (showAll) {
      allRows = [...makeRows(deps, 'dep'), ...(includeDev ? makeRows(devs, 'dev') : [])]
    } else {
      const coreDeps = Object.fromEntries(Object.entries(deps).filter(([k]) => interesting.includes(k)))
      const coreDevs = Object.fromEntries(Object.entries(devs).filter(([k]) => interesting.includes(k)))
      allRows = [...makeRows(coreDeps, 'dep'), ...(includeDev ? makeRows(coreDevs, 'dev') : [])]
    }

    if (onlyOutdated) {
      allRows = allRows.filter((r) => r.diff && r.diff !== 'same' && r.diff !== 'unknown')
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      allRows = allRows.filter((r) => r.name.toLowerCase().includes(q))
    }

    // Sort: outdated first (major > minor > patch > unknown > same), then alpha
    const rank: Record<NonNullable<Row['diff']>, number> = { major: 0, minor: 1, patch: 2, unknown: 3, same: 4 }
    allRows.sort((a, b) => {
      const ra = rank[a.diff || 'unknown']
      const rb = rank[b.diff || 'unknown']
      if (ra !== rb) return ra - rb
      return a.name.localeCompare(b.name)
    })

    return allRows
  }, [data, latest, showAll, includeDev, query, onlyOutdated])

  const summary = useMemo(() => {
    const total = rows.length
    const outdated = rows.filter((r) => r.diff && r.diff !== 'same' && r.diff !== 'unknown').length
    const majors = rows.filter((r) => r.diff === 'major').length
    const minors = rows.filter((r) => r.diff === 'minor').length
    const patchs = rows.filter((r) => r.diff === 'patch').length
    return { total, outdated, majors, minors, patchs }
  }, [rows])

  if (error || !data) return null
  if (!rows.length) return null

  function copy(cmd: string) {
    void navigator.clipboard?.writeText(cmd)
  }

  const bulk = useMemo(() => {
    const outdated = rows.filter((r) => r.diff && r.diff !== 'same' && r.diff !== 'unknown')
    const majors = outdated.filter((r) => r.diff === 'major')
    const minorsPatches = outdated.filter((r) => r.diff === 'minor' || r.diff === 'patch')
    const cmd = (list: Row[]) => {
      if (!list.length) return ''
      const oneLiner = `npm i ${list.map((r) => `${r.name}@latest`).join(' ')}`
      if (oneLiner.length <= 1000) return oneLiner
      // Fallback to multiline for very long lists
      return list.map((r) => `npm i ${r.name}@latest`).join('\n')
    }
    return {
      all: cmd(outdated),
      majors: cmd(majors),
      minorsPatches: cmd(minorsPatches),
      counts: { all: outdated.length, majors: majors.length, minorsPatches: minorsPatches.length },
    }
  }, [rows])

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
        <div className="text-muted-foreground">NPM status</div>
        <div className="text-muted-foreground">•</div>
        <div className="">{summary.outdated} outdated of {summary.total}</div>
        <div className="text-muted-foreground">•</div>
        <div className="">{summary.majors} major / {summary.minors} minor / {summary.patchs} patch</div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!bulk.majors}
            onClick={() => bulk.majors && copy(bulk.majors)}
            title={bulk.counts.majors ? `Copy ${bulk.counts.majors} major updates` : 'No major updates'}
          >
            Copy majors
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!bulk.minorsPatches}
            onClick={() => bulk.minorsPatches && copy(bulk.minorsPatches)}
            title={bulk.counts.minorsPatches ? `Copy ${bulk.counts.minorsPatches} minor/patch updates` : 'No minor/patch updates'}
          >
            Copy minor/patch
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={!bulk.all}
            onClick={() => bulk.all && copy(bulk.all)}
            title={bulk.counts.all ? `Copy ${bulk.counts.all} updates` : 'No updates'}
          >
            Copy all
          </Button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-7 w-32 rounded border px-2 text-xs bg-background"
          />
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setOnlyOutdated((v) => !v)}>
            {onlyOutdated ? 'Show all' : 'Only outdated'}
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setIncludeDev((v) => !v)}>
            {includeDev ? 'Hide dev' : 'Show dev'}
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Core only' : 'All deps'}
          </Button>
        </div>
      </div>
      <div className="divide-y text-sm">
        {rows.map((r) => {
          const current = cleanVersion(r.current) || r.current
          const latestV = cleanVersion(r.latest) || r.latest
          const npmUrl = `https://www.npmjs.com/package/${r.name}`
          const color =
            r.diff === 'major' ? 'bg-destructive/10 text-destructive' :
            r.diff === 'minor' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
            r.diff === 'patch' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
            r.diff === 'same' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
            'bg-muted text-foreground'
          const label = r.diff === 'major' ? 'major' : r.diff === 'minor' ? 'minor' : r.diff === 'patch' ? 'patch' : r.diff === 'same' ? 'up-to-date' : 'unknown'
          const installCmd = `npm i ${r.name}@latest` // keep caret policy to user; explicit latest
          return (
            <div key={r.name} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link href={npmUrl} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline truncate">
                  {r.name}
                </Link>
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] ${color}`}>{label}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground truncate" title={current || ''}>{current || '—'}</div>
              <div className="font-mono text-xs truncate" title={latestV || ''}>{latestV || '—'}</div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => copy(installCmd)}>
                  Copy update
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
