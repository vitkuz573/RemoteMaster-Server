import {getRequestConfig} from 'next-intl/server'
import {routing} from '@/i18n/routing'

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale
  const locale = (requested && routing.locales.includes(requested))
    ? requested
    : routing.defaultLocale
  const common = (await import(`@/locales/${locale}/common`)).default
  return { locale, messages: { common } }
})
