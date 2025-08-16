"use client"

import * as React from 'react'
import {NextIntlClientProvider} from 'next-intl'

export function IntlProvider({locale, messages, children}:{locale: string; messages: any; children: React.ReactNode}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}>
      {children}
    </NextIntlClientProvider>
  )
}

