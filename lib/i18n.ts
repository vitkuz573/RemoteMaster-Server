import { cookies, headers } from 'next/headers'

export type Locale = 'en' | 'ru'
export const DEFAULT_LOCALE: Locale = 'en'
export const SUPPORTED_LOCALES: Locale[] = ['en', 'ru']

export function detectLocaleFromHeaders(): Locale {
  try {
    const h = headers();
    const accept = (h.get('accept-language') || '').toLowerCase();
    if (accept.includes('ru')) return 'ru'
  } catch {}
  return DEFAULT_LOCALE
}

export function getInitialLocale(): Locale {
  try {
    const c = cookies();
    const v = c.get('LOCALE')?.value as Locale | undefined
    if (v && SUPPORTED_LOCALES.includes(v)) return v
  } catch {}
  return detectLocaleFromHeaders()
}

