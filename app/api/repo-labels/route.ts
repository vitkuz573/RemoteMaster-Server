import { NextResponse } from 'next/server'
import { appConfig } from '@/lib/app-config'

async function fetchGithub(owner: string, repo: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/labels?per_page=100`
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' }, next: { revalidate: 300 } })
  if (!res.ok) return [] as string[]
  const json = await res.json() as any[]
  return Array.isArray(json) ? json.map((l) => String(l.name)).filter(Boolean) : []
}

async function fetchGitlab(owner: string, repo: string) {
  try {
    const project = encodeURIComponent(`${owner}/${repo}`)
    const url = `https://gitlab.com/api/v4/projects/${project}/labels?per_page=100`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return [] as string[]
    const json = await res.json() as any[]
    return Array.isArray(json) ? json.map((l) => String(l.name)).filter(Boolean) : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const url = appConfig.repository.url
    const type = (appConfig.repository.type || 'github').toLowerCase()
    if (!url) return NextResponse.json({ labels: [] })
    const u = new URL(url)
    const parts = u.pathname.replace(/^\//,'').split('/')
    const owner = parts[0]
    const repo = parts[1]?.replace(/\.git$/,'')
    if (!owner || !repo) return NextResponse.json({ labels: [] })
    let labels: string[] = []
    if (type === 'github' || u.hostname.includes('github.com')) {
      labels = await fetchGithub(owner, repo)
    } else if (type === 'gitlab' || u.hostname.includes('gitlab.com')) {
      labels = await fetchGitlab(owner, repo)
    } else {
      labels = []
    }
    // Basic sanitization and sorting
    labels = Array.from(new Set(labels.map((s) => s.trim()).filter(Boolean))).sort()
    return NextResponse.json({ labels })
  } catch {
    return NextResponse.json({ labels: [] }, { status: 200 })
  }
}

