import type { NextConfig, Header } from "next";

// Resolve allowed API origin for CSP connect-src (enterprise: do not wildcard in prod)
const apiOrigin = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL;
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
})();

// Parse space/comma-separated env lists into arrays
const parseList = (v?: string): string[] => {
  if (!v) return []
  return v
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const toBool = (v: unknown, def = false) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
  return def
}

const enableCOI = toBool(process.env.ENABLE_COOP_COEP, false)
const enableTrustedTypes = toBool(process.env.ENABLE_TRUSTED_TYPES, false)
const cspReportOnly = toBool(process.env.CSP_REPORT_ONLY, false)

// Optional extra allowlists (space/comma separated origins)
const EXTRA = {
  CONNECT: parseList(process.env.CSP_CONNECT_SRC),
  IMG: parseList(process.env.CSP_IMG_SRC),
  FONT: parseList(process.env.CSP_FONT_SRC),
  SCRIPT: parseList(process.env.CSP_SCRIPT_SRC),
  STYLE: parseList(process.env.CSP_STYLE_SRC),
  FRAME: parseList(process.env.CSP_FRAME_SRC),
  FRAME_ANCESTORS: parseList(process.env.CSP_FRAME_ANCESTORS),
  REPORT_URI: process.env.CSP_REPORT_URI || '/api/csp-reports',
  UIR: toBool(process.env.CSP_UPGRADE_INSECURE_REQUESTS, true),
  BAM: toBool(process.env.CSP_BLOCK_ALL_MIXED, true),
}

const csp = (isDev: boolean): string => {
  const directives: string[] = [];
  directives.push("default-src 'self'");
  {
    const style = ["style-src 'self'", ...(EXTRA.STYLE ?? [])]
    if (isDev) style.push("'unsafe-inline'")
    directives.push(style.join(' '))
  }
  directives.push("img-src 'self' data: blob:");
  if (EXTRA.IMG.length) {
    directives.push(["img-src 'self' data: blob:", ...EXTRA.IMG].join(' '))
  }
  {
    const font = ["font-src 'self' data:", ...(EXTRA.FONT ?? [])]
    directives.push(font.join(' '))
  }
  // Dev needs inline/eval for HMR; Prod: remove both for strictness
  directives.push(
    isDev
      ? ["script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:", ...(EXTRA.SCRIPT ?? [])].join(' ')
      : ["script-src 'self'", ...(EXTRA.SCRIPT ?? [])].join(' ')
  );
  // Limit outbound connections; allow localhost/ws only during development
  if (isDev) {
    directives.push(
      [
        "connect-src 'self'",
        apiOrigin || '',
        'https:',
        'http://localhost:*',
        'ws://localhost:*',
        ...EXTRA.CONNECT,
      ].filter(Boolean).join(' ')
    );
  } else {
    directives.push([
      "connect-src 'self'",
      apiOrigin || '',
      ...EXTRA.CONNECT,
    ].filter(Boolean).join(' '));
  }
  directives.push("object-src 'none'");
  if (EXTRA.FRAME.length) {
    directives.push(["frame-src 'self'", ...EXTRA.FRAME].join(' '))
  } else {
    directives.push("frame-src 'none'")
  }
  if (EXTRA.FRAME_ANCESTORS.length) {
    directives.push(["frame-ancestors", ...EXTRA.FRAME_ANCESTORS].join(' '))
  } else {
    directives.push("frame-ancestors 'none'")
  }
  directives.push("worker-src 'self' blob:");
  directives.push("base-uri 'self'");
  directives.push("form-action 'self'");
  // Enterprise: prefer upgrade and reporting endpoint
  if (EXTRA.UIR) directives.push('upgrade-insecure-requests');
  if (EXTRA.BAM) directives.push('block-all-mixed-content');
  if (enableTrustedTypes) {
    directives.push("require-trusted-types-for 'script'");
    directives.push("trusted-types default");
  }
  directives.push('report-to csp');
  directives.push(`report-uri ${EXTRA.REPORT_URI}`);
  return directives.join('; ');
};

const securityHeaders = (isDev: boolean): Header[] => {
  const headers: Header[] = [
    { key: 'Content-Security-Policy', value: csp(isDev) },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains; preload' },
    // Additional enterprise-grade headers
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    { key: 'Origin-Agent-Cluster', value: '?1' },
    // Reporting API endpoint
    { key: 'Reporting-Endpoints', value: 'csp="/api/csp-reports"' },
  ]
  // Optional: enable cross-origin isolation when explicitly requested (dev and prod)
  if (enableCOI) {
    headers.push({ key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' })
  }
  if (isDev) {
    // Non-production: avoid indexing
    headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })
  }
  return headers
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
  // Minimize noisy console logs in production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const headers = securityHeaders(isDev)
    const base = [
      {
        source: '/:path*',
        headers,
      },
      // Sensitive route: never cache login page
      {
        source: '/login',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
    // In dev, also add report-only CSP to surface issues without blocking
    if (isDev || cspReportOnly) {
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
