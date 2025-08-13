export async function register() {
  // Minimal instrumentation hook for Next.js App Router
  // Avoid heavy deps; rely on built-in logging and our client logger
  const env = process.env.NODE_ENV || 'development'
  // eslint-disable-next-line no-console
  console.info('[instrumentation] register()', { env })
}

