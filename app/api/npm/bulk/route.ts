import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function fetchLatest(name: string): Promise<[string, string | undefined]> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { cache: 'no-store' })
    if (!res.ok) return [name, undefined]
    const json = await res.json()
    const latest = json?.['dist-tags']?.latest as string | undefined
    return [name, latest]
  } catch {
    return [name, undefined]
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const namesParam = url.searchParams.get('names') || ''
  const names = namesParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (!names.length) return NextResponse.json({ error: 'missing_names' }, { status: 400 })

  // Limit concurrency in case of large lists
  const limit = 6
  const results: Array<[string, string | undefined]> = []
  for (let i = 0; i < names.length; i += limit) {
    const chunk = names.slice(i, i + limit)
    // eslint-disable-next-line no-await-in-loop
    const data = await Promise.all(chunk.map(fetchLatest))
    results.push(...data)
  }
  const body = Object.fromEntries(results)
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // Help edge/platform caches; clients still request fresh when reloading About
      'cache-control': 's-maxage=900, stale-while-revalidate=86400',
    },
  })
}

