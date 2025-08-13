import { appConfig } from './app-config'

export class HttpError<TBody = unknown> extends Error {
  status: number
  url: string
  body: TBody | null
  constructor(message: string, status: number, url: string, body: TBody | null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
    this.body = body
  }
}

export interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
  backoffFactor?: number
  correlationId?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchJson<T>(url: string, init: FetchJsonOptions = {}): Promise<T> {
  const {
    timeoutMs = 10000,
    retries = 1,
    retryDelayMs = 300,
    backoffFactor = 2,
    correlationId,
    headers,
    ...rest
  } = init

  const requestId = correlationId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
  const baseHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'X-Request-Id': requestId,
    'X-Client': `${appConfig.name}@${appConfig.version}`,
    'X-Request-TS': new Date().toISOString(),
  }

  // Merge headers safely
  const mergedHeaders: HeadersInit = Array.isArray(headers)
    ? [...headers, ...Object.entries(baseHeaders)]
    : typeof headers === 'object'
      ? { ...(headers as Record<string, string>), ...baseHeaders }
      : baseHeaders

  let attempt = 0
  let lastError: unknown
  let delay = retryDelayMs

  while (attempt <= retries) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...rest, headers: mergedHeaders, signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        let body: any = null
        try { body = await res.json() } catch {}
        throw new HttpError((body && (body.error || body.message)) || `HTTP ${res.status}`, res.status, url, body)
      }
      return (await res.json()) as T
    } catch (e) {
      clearTimeout(timer)
      lastError = e
      const shouldRetry =
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof TypeError) ||
        (e instanceof HttpError && e.status >= 500)

      if (!shouldRetry || attempt === retries) break
      await sleep(delay)
      delay *= backoffFactor
      attempt += 1
    }
  }
  // At this point, we failed
  if (lastError instanceof Error) throw lastError
  throw new Error('Request failed')
}

