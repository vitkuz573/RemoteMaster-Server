"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Metric = { name: string; value: number; rating?: 'good' | 'needs-improvement' | 'poor' }

export function WebVitalsWidget() {
  const [metrics, setMetrics] = useState<Record<string, Metric>>({})

  useEffect(() => {
    let unsubscribed = false
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const put = (m: any) => {
        if (unsubscribed) return
        setMetrics((prev) => ({ ...prev, [m.name]: { name: m.name, value: Math.round(m.value * 1000) / 1000, rating: m.rating } }))
      }
      onCLS(put); onINP(put); onLCP(put); onFCP(put); onTTFB(put)
    })
    return () => { unsubscribed = true }
  }, [])

  const order = ['TTFB', 'FCP', 'LCP', 'INP', 'CLS']
  const fmt = (name: string, v?: number) => v === undefined ? '—' : name === 'CLS' ? v.toFixed(3) : `${v}`
  const variant = (m?: Metric) => !m ? 'outline' : m.rating === 'good' ? 'default' : m.rating === 'needs-improvement' ? 'secondary' : 'destructive'

  return (
    <div className="flex flex-wrap gap-2">
      {order.map((k) => (
        <Badge key={k} variant={variant(metrics[k]) as any}>
          {k}: {fmt(k, metrics[k]?.value)}
        </Badge>
      ))}
    </div>
  )
}

