"use client"

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function EndpointActions({ url }: { url?: string }) {
  if (!url) return null
  const t = useTranslations('common')
  const copy = async () => { try { await navigator.clipboard.writeText(url) } catch {} }
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer noopener">{t('open_btn', {fallback: 'Open'})}</a></Button>
      <Button size="sm" variant="outline" onClick={copy}>{t('copy_btn', {fallback: 'Copy'})}</Button>
    </div>
  )
}
