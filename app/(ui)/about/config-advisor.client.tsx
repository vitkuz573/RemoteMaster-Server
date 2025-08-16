"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldAlert, Info, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Advice = { level: 'danger' | 'warning' | 'info'; text: string }

export function ConfigAdvisorClient({ advices, signature }: { advices: Advice[]; signature: string }) {
  const storageKey = 'advisor:dismissed'
  const [visible, setVisible] = useState(true)
  const [extra, setExtra] = useState<Advice[]>([])
  const t = useTranslations('common')
  const icon = (lvl: Advice['level']) => lvl==='danger'? <ShieldAlert className="size-4"/> : lvl==='warning'? <AlertTriangle className="size-4"/> : <Info className="size-4"/>
  const cls = (lvl: Advice['level']) => lvl==='danger'? 'text-red-600 dark:text-red-400' : lvl==='warning'? 'text-yellow-700 dark:text-yellow-300' : 'text-blue-700 dark:text-blue-300'

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === signature) setVisible(false)
      else setVisible(true)
    } catch {}
  }, [signature])

  useEffect(() => {
    let alive = true
    fetch('/api/config-lint', { cache: 'no-store' })
      .then(r => r.json())
      .then((d) => { if (alive) setExtra(Array.isArray(d?.advices) ? d.advices : []) })
      .catch(() => { if (alive) setExtra([]) })
    return () => { alive = false }
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(storageKey, signature) } catch {}
    setVisible(false)
  }

  if (!visible) {
    return (
      <button className="text-xs underline" onClick={()=>{ try { localStorage.removeItem(storageKey) } catch {}; setVisible(true) }}>
        {t('advisor_show')}
      </button>
    )
  }
  return (
    <div className="rounded-md border p-3 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium">{t('advisor_title')}</div>
        <button aria-label={t('advisor_dismiss')} className="text-xs text-muted-foreground hover:text-foreground" onClick={dismiss}>
          <X className="size-3.5" />
        </button>
      </div>
      <ul className="space-y-2">
        {[...advices, ...extra].map((a, i) => (
          <li key={i} className={`flex items-center gap-2 ${cls(a.level)}`}>
            {icon(a.level)}
            <span className="text-sm">{a.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
