import {getRequestConfig} from 'next-intl/server'
import {cookies, headers} from 'next/headers'

// Without i18n routing: rely on next-intl to pass the resolved locale param
export default getRequestConfig(async () => {
  // Resolve locale from cookie or Accept-Language
  let loc: 'en' | 'ru' = 'en'
  try {
    const c = cookies().get('NEXT_LOCALE')?.value
    if (c === 'ru' || c === 'en') loc = c
    else {
      const accept = (headers().get('accept-language') || '').toLowerCase()
      if (accept.includes('ru')) loc = 'ru'
    }
  } catch {}
  const common = (await import(`../locales/${loc}/common`)).default
  return { locale: loc, messages: { common } }
})
