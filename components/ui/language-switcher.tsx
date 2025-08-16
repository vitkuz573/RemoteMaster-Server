"use client"

import { useLocale } from '@/contexts/locale-context'
import { Toggle } from '@/components/ui/toggle'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const options: Array<{ id: 'en'|'ru'; label: string }> = [
    { id: 'en', label: 'EN' },
    { id: 'ru', label: 'RU' },
  ]
  return (
    <div className="inline-flex rounded-md border p-0.5 bg-muted/40">
      {options.map((o) => (
        <Toggle
          key={o.id}
          pressed={locale === o.id}
          onPressedChange={() => setLocale(o.id)}
          className={
            `h-8 px-3 text-xs ${locale === o.id ? 'bg-background shadow-sm' : 'bg-transparent'}`
          }
        >
          {o.label}
        </Toggle>
      ))}
    </div>
  )
}

