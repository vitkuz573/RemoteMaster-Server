import { NextResponse } from 'next/server'
import { appConfig } from '@/lib/app-config'

type Label = { name: string; color?: string; description?: string }

async function fetchGithub(owner: string, repo: string): Promise<Label[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/labels?per_page=100`
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' }, next: { revalidate: 300 } })
  if (!res.ok) return []
  const json = (await res.json()) as any[]
  if (!Array.isArray(json)) return []
  return json
    .map((l) => ({
      name: String(l?.name ?? ''),
      color: l?.color ? `#${String(l.color).replace(/^#/, '')}` : undefined,
      description: typeof l?.description === 'string' ? l.description : undefined,
    }))
    .filter((l) => !!l.name)
}

async function fetchGitlab(owner: string, repo: string): Promise<Label[]> {
  try {
    const project = encodeURIComponent(`${owner}/${repo}`)
    const url = `https://gitlab.com/api/v4/projects/${project}/labels?per_page=100`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = (await res.json()) as any[]
    if (!Array.isArray(json)) return []
    return json
      .map((l) => ({
        name: String(l?.name ?? ''),
        color: typeof l?.color === 'string' ? String(l.color) : undefined,
        description: typeof l?.description === 'string' ? l.description : undefined,
      }))
      .filter((l) => !!l.name)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const url = appConfig.repository.url
    const type = (appConfig.repository.type || 'github').toLowerCase()
    if (!url) return NextResponse.json({ labels: [] as Label[] })
    const u = new URL(url)
    const parts = u.pathname.replace(/^\//,'').split('/')
    const owner = parts[0]
    const repo = parts[1]?.replace(/\.git$/,'')
    if (!owner || !repo) return NextResponse.json({ labels: [] as Label[] })
    let labels: Label[] = []
    if (type === 'github' || u.hostname.includes('github.com')) {
      labels = await fetchGithub(owner, repo)
    } else if (type === 'gitlab' || u.hostname.includes('gitlab.com')) {
      labels = await fetchGitlab(owner, repo)
    } else {
      labels = []
    }
    // Basic sanitization and sorting
    const uniq = new Map<string, Label>()
    for (const l of labels) {
      const name = l.name.trim()
      if (!name) continue
      if (!uniq.has(name)) uniq.set(name, { name, color: l.color, description: l.description })
    }
    const sorted = Array.from(uniq.values()).sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ labels: sorted })
  } catch {
    return NextResponse.json({ labels: [] as Label[] }, { status: 200 })
  }
}
