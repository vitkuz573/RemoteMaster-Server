import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Keep conservative defaults; can be tuned via envs if needed
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    environment: process.env.NEXT_PUBLIC_REPO_BRANCH || process.env.NODE_ENV,
  })
}

