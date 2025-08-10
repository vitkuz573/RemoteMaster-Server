import type { NextConfig, Header } from "next";

const csp = (
  isDev: boolean,
) => [
  "default-src 'self'",
  // allow Next.js inline styles in dev; in prod rely on hashed styles
  isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Dev: allow inline/eval for HMR/runtime; Prod: block inline
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:"
    : "script-src 'self' 'unsafe-eval'",
  "connect-src 'self' https: http://localhost:* ws://localhost:*",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
].join('; ')

const securityHeaders = (isDev: boolean): Header[] => [
  {
    key: 'Content-Security-Policy',
    // In dev, set report-only to avoid blocking HMR; browsers ignore value if header name is different
    // We attach CSP as standard header even in dev to surface issues early
    value: csp(isDev),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  },
  {
    key: 'Strict-Transport-Security',
    // 6 months; only applies when served over HTTPS
    value: 'max-age=15552000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  // Fix cross-origin warning in development
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.localhost'],
  
  // Performance optimizations for development
  experimental: {
    // Enable server components HMR cache for better development performance
    serverComponentsHmrCache: true,
    
    // Optimize package imports for better bundling
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    
    // Enable CSS chunking for better performance
    cssChunking: true,
  },
  
  // Enable detailed fetch logging for debugging
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  
  // Optimize images
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      // Enable faster refresh
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const headers = securityHeaders(isDev)
    const base = [
      {
        source: '/:path*',
        headers,
      },
    ]
    // In dev, also add report-only CSP to surface issues without blocking
    if (isDev) {
      base.push({
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy-Report-Only', value: csp(true) }],
      })
    }
    return base
  },
  // No rewrites needed; device routes are explicit in app/device
};

export default nextConfig;
