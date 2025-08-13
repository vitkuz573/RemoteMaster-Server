import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Enterprise: enforce HTTPS in production behind proxies/CDNs
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '')
    if (proto !== 'https') {
      const url = request.nextUrl.clone()
      url.protocol = 'https:'
      return NextResponse.redirect(url, 308)
    }
  }
  // Fetch Metadata protection for state-changing requests to API routes
  const method = request.method.toUpperCase()
  const isStateChanging = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/api') && isStateChanging) {
    const sfSite = (request.headers.get('sec-fetch-site') || '').toLowerCase()
    const sfMode = (request.headers.get('sec-fetch-mode') || '').toLowerCase()
    const sfDest = (request.headers.get('sec-fetch-dest') || '').toLowerCase()
    // Allow same-origin and same-site only; block cross-site state-changing requests
    const same = sfSite === 'same-origin' || sfSite === 'same-site' || sfSite === ''
    const allowedMode = sfMode === 'cors' || sfMode === 'same-origin' || sfMode === ''
    const allowedDest = sfDest === 'empty' || sfDest === ''
    if (!same || !allowedMode || !allowedDest) {
      return new NextResponse(null, { status: 403 })
    }
  }
  return NextResponse.next()
}

// Skip static assets and API routes
export const config = {
  matcher: [
    // All app routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Also run on API routes for fetch-metadata protection
    '/api/:path*',
  ],
}
