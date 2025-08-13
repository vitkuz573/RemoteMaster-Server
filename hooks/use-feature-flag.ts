"use client";

import { env } from '@/lib/env'
import { useMemo } from 'react'

export type FeatureFlag = keyof Pick<
  typeof env,
  | 'NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS'
  | 'NEXT_PUBLIC_FEATURE_DEBUG_TOASTS'
  | 'NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI'
>

export function useFeatureFlag(flag: FeatureFlag): boolean {
  // Runtime override via localStorage for quick toggling in development
  return useMemo(() => {
    try {
      const key = `ff:${flag}`
      const v = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (v === '1') return true
      if (v === '0') return false
    } catch {}
    return env[flag]
  }, [flag])
}

