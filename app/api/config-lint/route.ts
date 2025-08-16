import { NextResponse } from 'next/server'
import { appConfig } from '@/lib/app-config'
import { env } from '@/lib/env'

export async function GET() {
  const advices: { level: 'danger'|'warning'|'info'; text: string }[] = []
  const isProd = appConfig.environment === 'production'
  if (isProd && env.NEXT_PUBLIC_FEATURE_DEV_CREDENTIALS) advices.push({ level: 'danger', text: 'Dev credentials feature is ENABLED in production.' })
  if (isProd && env.NEXT_PUBLIC_FEATURE_DEBUG_TOASTS) advices.push({ level: 'warning', text: 'Debug toasts feature is ENABLED in production.' })
  if (isProd && env.NEXT_PUBLIC_FEATURE_EXPERIMENTAL_UI) advices.push({ level: 'info', text: 'Experimental UI is ENABLED in production.' })
  if (isProd && !env.NEXT_PUBLIC_CSP_REPORTING_ENABLED) advices.push({ level: 'info', text: 'CSP reporting is DISABLED in production.' })
  if (!appConfig.endpoints.api) advices.push({ level: 'warning', text: 'API endpoint is not configured.' })
  return NextResponse.json({ advices })
}

