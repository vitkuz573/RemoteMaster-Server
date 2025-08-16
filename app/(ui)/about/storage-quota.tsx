"use client"

import { useEffect, useState } from 'react'

export function StorageQuota() {
  const [info, setInfo] = useState<{used:number; quota:number} | null>(null)
  useEffect(() => {
    let mounted = true
    if ('storage' in navigator && (navigator as any).storage?.estimate) {
      ;(navigator as any).storage.estimate().then((res: any) => {
        if (!mounted) return
        setInfo({ used: res.usage || 0, quota: res.quota || 0 })
      }).catch(() => {})
    }
    return () => { mounted = false }
  }, [])
  if (!info) return null
  const usedMB = (info.used / (1024*1024)).toFixed(2)
  const quotaMB = (info.quota / (1024*1024)).toFixed(2)
  const pct = info.quota ? Math.round((info.used / info.quota) * 100) : 0
  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-mono">{usedMB}MB</span> / <span className="font-mono">{quotaMB}MB</span> ({pct}%)
    </div>
  )
}

