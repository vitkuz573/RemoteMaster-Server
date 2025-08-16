import {getRequestConfig, getLocale} from 'next-intl/server'

// Without i18n routing: let next-intl resolve locale (cookie or default)
export default getRequestConfig(async () => {
  const locale = await getLocale()
  const common = (await import(`@/locales/${locale}/common`)).default
  return { messages: { common } }
})
