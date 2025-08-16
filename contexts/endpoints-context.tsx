"use client"

import { createContext, useContext, useMemo, useState } from 'react'

export type EndpointsSummary = {
  total: number
  ok: number
  slow: number
  worstMs: number | null
}

type Ctx = {
  intervalSec: number | null
  setIntervalSec: (v: number | null) => void
  remaining: number
  setRemaining: (v: number) => void
  summary: EndpointsSummary
  setSummary: (s: EndpointsSummary) => void
  runAll?: () => void
  setRunner: (fn: (() => void) | undefined) => void
  group: string | null
  setGroup: (g: string | null) => void
  groups: string[]
  setGroups: (arr: string[]) => void
}

const EndpointsCtx = createContext<Ctx | null>(null)

export function EndpointsProvider({ children }: { children: React.ReactNode }) {
  const [intervalSec, setIntervalSec] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [summary, setSummary] = useState<EndpointsSummary>({ total: 0, ok: 0, slow: 0, worstMs: null })
  const [runAll, _setRunner] = useState<(() => void) | undefined>(undefined)
  const [group, setGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const value = useMemo<Ctx>(() => ({
    intervalSec,
    setIntervalSec,
    remaining,
    setRemaining,
    summary,
    setSummary,
    runAll,
    setRunner: _setRunner,
    group,
    setGroup,
    groups,
    setGroups,
  }), [intervalSec, remaining, summary, runAll, group, groups])
  return <EndpointsCtx.Provider value={value}>{children}</EndpointsCtx.Provider>
}

export function useEndpointsContext() {
  const ctx = useContext(EndpointsCtx)
  if (!ctx) throw new Error('useEndpointsContext must be used within EndpointsProvider')
  return ctx
}
