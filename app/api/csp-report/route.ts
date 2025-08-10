import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/csp-report')) {
      // Some browsers send application/json
      // continue best-effort parsing
    }
    const body = await request.json().catch(() => ({}))
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('CSP report:', JSON.stringify(body))
    }
  } catch {
    // ignore
  }
  return new NextResponse(null, { status: 204 })
}

