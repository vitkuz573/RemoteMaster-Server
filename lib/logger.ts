import { appConfig } from './app-config'
import { env } from './env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogPayload {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: { name: string; message: string; stack?: string | null }
  timestamp: string
  environment: string
  app: {
    name: string
    version: string
    buildHash: string
    buildBranch: string
  }
  client?: {
    userAgent?: string
    language?: string
    platform?: string
  }
}

const isServer = typeof window === 'undefined'

const basePayload = (level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): LogPayload => {
  const err = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack ?? null } : undefined
  return {
    level,
    message,
    context,
    error: err,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    app: {
      name: appConfig.name,
      version: appConfig.version,
      buildHash: appConfig.buildHash,
      buildBranch: appConfig.buildBranch,
    },
    client: isServer
      ? undefined
      : {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: (navigator as any).platform,
        },
  }
}

async function send(payload: LogPayload) {
  // Only forward to server when explicitly enabled (enterprise default: off)
  if (!env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED) return
  try {
    if (!isServer && 'sendBeacon' in navigator) {
      const ok = navigator.sendBeacon('/api/logs', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      if (ok) return
    }
  } catch {}
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {}
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
  const payload = basePayload(level, message, context, error)
  // Console output for local visibility; keep concise
  const args = [
    `[${payload.level.toUpperCase()}] ${payload.message}`,
    payload.context ? payload.context : undefined,
    payload.error ? payload.error : undefined,
  ].filter(Boolean)
  // eslint-disable-next-line no-console
  const c: Console = console
  if (level === 'error') c.error(...(args as any[]))
  else if (level === 'warn') c.warn(...(args as any[]))
  else if (level === 'debug') c.debug(...(args as any[]))
  else c.info(...(args as any[]))
  // Fire-and-forget forwarding
  void send(payload)
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => log('error', message, context, error),
}

export type { LogLevel, LogPayload }

