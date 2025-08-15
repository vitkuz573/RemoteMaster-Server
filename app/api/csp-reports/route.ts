import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory rate limiter (per-IP) to reduce report noise
const WINDOW_MS = 60_000 // 1 minute
const LIMIT = 30 // max reports per window per IP
type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for') || ''
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  return 'unknown'
}

function isRateLimited(key: string) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  bucket.count += 1
  if (bucket.count > LIMIT) return true
  return false
}

// Accept both legacy CSP reports and Reporting API batches.
// Intentionally discard payloads after minimal validation to avoid storing sensitive data.

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    return new NextResponse(null, { status: 429 })
  }
  try {
    const ct = (req.headers.get('content-type') || '').toLowerCase()
    // Legacy: application/csp-report
    if (ct.includes('application/csp-report')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const body = await req.json().catch(() => ({}))
      // Optionally log in development only
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CSP] Violation (legacy csp-report) received')
      }
    } else {
      // Reporting API: application/reports+json
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const reports = await req.json().catch(() => [])
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CSP] Violation (reports+json) received')
      }
    }
  } catch {
    // ignore parse errors
  }
  return new NextResponse(null, { status: 204 })
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } })
}
