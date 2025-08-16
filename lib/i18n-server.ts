import { cookies, headers } from 'next/headers'
import type { Locale } from './i18n'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n'

export function detectLocaleFromHeadersServer(): Locale {
  try {
    const h = headers();
    const accept = (h.get('accept-language') || '').toLowerCase();
    if (accept.includes('ru')) return 'ru'
  } catch {}
  return DEFAULT_LOCALE
}

export function getInitialLocaleServer(): Locale {
  try {
    const c = cookies();
    const v = c.get('LOCALE')?.value as Locale | undefined
    if (v && SUPPORTED_LOCALES.includes(v)) return v
  } catch {}
  return detectLocaleFromHeadersServer()
}

