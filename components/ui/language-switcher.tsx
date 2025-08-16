"use client"

import { Toggle } from '@/components/ui/toggle'
import {useLocale} from 'next-intl'
import {useRouter} from 'next/navigation'

export function LanguageSwitcher() {
  const locale = useLocale() as 'en'|'ru'
  const router = useRouter()
  const options: Array<{ id: 'en'|'ru'; label: string }> = [
    { id: 'en', label: 'EN' },
    { id: 'ru', label: 'RU' },
  ]

  const switchTo = async (l: 'en'|'ru') => {
    try {
      document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`
    } catch {}
    router.refresh()
  }

  return (
    <div className="inline-flex rounded-md border p-0.5 bg-muted/40">
      {options.map((o) => (
        <Toggle
          key={o.id}
          pressed={locale === o.id}
          onPressedChange={() => switchTo(o.id)}
          className={`h-8 px-3 text-xs ${locale === o.id ? 'bg-background shadow-sm' : 'bg-transparent'}`}
        >
          {o.label}
        </Toggle>
      ))}
    </div>
  )
}
