import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Client error report:', JSON.stringify(body))
    }
  } catch {}
  return new NextResponse(null, { status: 204 })
}

