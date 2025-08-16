import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { pkg: string } }) {
  const name = params.pkg
  if (!name) return NextResponse.json({ error: 'missing_package' }, { status: 400 })
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'npm_not_ok', status: res.status }, { status: 502 })
    const json = await res.json()
    const latest = json?.['dist-tags']?.latest as string | undefined
    return NextResponse.json({ name, latest })
  } catch (e) {
    return NextResponse.json({ error: 'npm_fetch_failed' }, { status: 502 })
  }
}

