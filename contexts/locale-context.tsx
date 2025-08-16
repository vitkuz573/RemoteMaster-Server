"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/i18n'
import en from '@/locales/en/common'
import ru from '@/locales/ru/common'

type Dict = Record<string, string>

const DICTS: Record<Locale, Dict> = { en, ru }

type LocaleContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

export function LocaleProvider({ initialLocale = DEFAULT_LOCALE, children }: { initialLocale?: Locale, children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    try { document.cookie = `LOCALE=${locale}; path=/; max-age=31536000` } catch {}
  }, [locale])

  const setLocale = (l: Locale) => setLocaleState(l)

  const t = (key: string) => (DICTS[locale] && DICTS[locale][key]) || (DICTS.en[key] || key)

  const value = useMemo(() => ({ locale, setLocale, t }), [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

