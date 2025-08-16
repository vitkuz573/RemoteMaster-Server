"use client"

import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'

export function SentryTest() {
  const enabled = Boolean(env.NEXT_PUBLIC_SENTRY_DSN)
  const trigger = () => {
    // Force an error to test Sentry capture
    // eslint-disable-next-line no-throw-literal
    throw new Error('Sentry test error from About page')
  }
  if (!enabled) return null
  return (
    <Button variant="destructive" onClick={trigger}>
      Trigger Sentry error
    </Button>
  )
}

