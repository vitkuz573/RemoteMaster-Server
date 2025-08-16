import {getRequestConfig} from 'next-intl/server'

// Without i18n routing: rely on next-intl to pass the resolved locale param
export default getRequestConfig(async ({locale}) => {
  const l = await locale
  const loc = (l === 'ru' || l === 'en') ? l : 'en'
  const common = (await import(`@/locales/${loc}/common`)).default
  return { locale: loc, messages: { common } }
})
