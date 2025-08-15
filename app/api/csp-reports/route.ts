import { NextResponse } from 'next/server'

// Minimal CSP report endpoint; stores nothing by default to avoid PII retention.
// Hook into your logging system here if desired.
export async function POST(request: Request) {
  try {
    // Best-effort read to avoid throwing on invalid payloads
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/reports+json') || contentType.includes('application/json')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _body = await request.json().catch(() => null)
      // You can send to your log aggregator here
    }
  } catch {}
  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  return new NextResponse(null, { status: 405 })
}

