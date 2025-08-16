"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

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
}

const interesting = [
  'next',
  'react',
  'next-intl',
  'typescript',
  'eslint',
  'tailwindcss',
]

export function NpmVersions() {
  const [data, setData] = useState<PkgResponse | null>(null)
  const [latest, setLatest] = useState<Record<string, string | undefined>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/package-json', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j: PkgResponse) => { if (alive) setData(j) })
      .catch(() => { if (alive) setError('failed') })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    async function run() {
      if (!data) return
      const deps: PkgMap = { ...(data.dependencies || {}), ...(data.devDependencies || {}) }
      const names = interesting.filter((n) => deps[n])
      const entries = await Promise.all(names.map(async (n) => {
        try {
          const r = await fetch(`/api/npm/${encodeURIComponent(n)}`, { cache: 'no-store' })
          if (!r.ok) return [n, undefined] as const
          const j = await r.json()
          return [n, j?.latest as string | undefined] as const
        } catch { return [n, undefined] as const }
      }))
      if (alive) setLatest(Object.fromEntries(entries))
    }
    run()
    return () => { alive = false }
  }, [data])

  const rows: Row[] = useMemo(() => {
    if (!data) return []
    const deps: PkgMap = { ...(data.dependencies || {}), ...(data.devDependencies || {}) }
    return interesting
      .filter((n) => deps[n])
      .map((n) => ({ name: n, current: deps[n], latest: latest[n] }))
  }, [data, latest])

  if (error || !data) return null
  if (!rows.length) return null

  return (
    <div className="rounded-md border">
      <div className="px-3 py-2 text-xs text-muted-foreground">NPM status</div>
      <div className="divide-y text-sm">
        {rows.map((r) => {
          const cleanCurrent = r.current?.replace(/^\^|~/, '')
          const cleanLatest = r.latest
          const outdated = cleanLatest && cleanCurrent && cleanCurrent !== cleanLatest
          const npmUrl = `https://www.npmjs.com/package/${r.name}`
          return (
            <div key={r.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2">
              <div className="flex items-center gap-2">
                <Link href={npmUrl} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">
                  {r.name}
                </Link>
              </div>
              <div className="font-mono text-xs text-muted-foreground">{cleanCurrent || '—'}</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono text-xs">{cleanLatest || '—'}</span>
                {cleanLatest ? (
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] ${outdated ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                    {outdated ? 'Outdated' : 'Up-to-date'}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

