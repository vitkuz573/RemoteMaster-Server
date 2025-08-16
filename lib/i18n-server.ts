import { cookies, headers } from 'next/headers'
import type { Locale } from './i18n'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n'
import en from '@/locales/en/common'
import ru from '@/locales/ru/common'

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

export type Dict = Record<string, string>
export function getDictServer(): Dict {
  const l = getInitialLocaleServer()
  return l === 'ru' ? ru : en
}
