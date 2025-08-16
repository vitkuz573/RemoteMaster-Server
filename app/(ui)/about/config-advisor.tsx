import { appConfig } from '@/lib/app-config'
import { env } from '@/lib/env'
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react'

type Advice = { level: 'danger' | 'warning' | 'info'; text: string }

export function ConfigAdvisor() {
  const advices: Advice[] = []
  const isProd = appConfig.environment === 'production'

  if (isProd && env.NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS) {
    advices.push({ level: 'danger', text: 'Dev credentials feature is ENABLED in production.' })
  }
  if (isProd && env.NEXT_PUBLIC_FEATURE_DEBUG_TOASTS) {
    advices.push({ level: 'warning', text: 'Debug toasts feature is ENABLED in production.' })
  }
  if (isProd && env.NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI) {
    advices.push({ level: 'info', text: 'Experimental UI is enabled in production.' })
  }
  // Reporting API is recommended in prod
  if (isProd && !env.NEXT_PUBLIC_CSP_REPORTING_ENABLED) {
    advices.push({ level: 'info', text: 'CSP reporting is disabled; consider enabling in production.' })
  }

  // Trusted Types recommendation
  try {
    const tt = String(process.env.ENABLE_TRUSTED_TYPES || '').toLowerCase()
    if (isProd && (tt === 'false' || tt === '0' || tt === 'no')) {
      advices.push({ level: 'info', text: 'Trusted Types are disabled; consider enabling in production.' })
    }
  } catch {}

  if (advices.length === 0) return null
  const icon = (lvl: Advice['level']) => lvl==='danger'? <ShieldAlert className="size-4"/> : lvl==='warning'? <AlertTriangle className="size-4"/> : <Info className="size-4"/>
  const cls = (lvl: Advice['level']) => lvl==='danger'? 'text-red-600 dark:text-red-400' : lvl==='warning'? 'text-yellow-700 dark:text-yellow-300' : 'text-blue-700 dark:text-blue-300'
  return (
    <div className="rounded-md border p-3 bg-muted/30">
      <div className="text-xs font-medium mb-2">Configuration Advisor</div>
      <ul className="space-y-2">
        {advices.map((a, i) => (
          <li key={i} className={`flex items-center gap-2 ${cls(a.level)}`}>
            {icon(a.level)}
            <span>{a.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
