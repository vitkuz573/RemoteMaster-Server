import { appConfig } from '@/lib/app-config'
import { env } from '@/lib/env'
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react'
import { ConfigAdvisorClient } from './config-advisor.client'

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
  return <ConfigAdvisorClient advices={advices} signature={`${appConfig.version}|${appConfig.buildHash}|${advices.map(a=>a.level+':'+a.text).join('|')}`} />
}
