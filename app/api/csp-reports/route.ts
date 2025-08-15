import { NextResponse, type NextRequest } from 'next/server'

// Accept both legacy CSP reports and Reporting API batches.
// Intentionally discard payloads after minimal validation to avoid storing sensitive data.

export async function POST(req: NextRequest) {
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

