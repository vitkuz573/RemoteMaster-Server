import { NextRequest, NextResponse } from 'next/server'
import { appConfig } from '@/lib/app-config'
import { getOctokit, parseGithubRepo } from '@/lib/github-client'

export async function POST(req: NextRequest) {
  try {
    const { title, body, labels } = await req.json()
    const repoUrl = appConfig.repository.url
    if (!repoUrl) return NextResponse.json({ error: 'Repository URL is not configured' }, { status: 400 })
    const type = (appConfig.repository.type || 'github').toLowerCase()
    if (type !== 'github' && !repoUrl.includes('github.com')) {
      return NextResponse.json({ error: 'Only GitHub is supported for now' }, { status: 501 })
    }
    const gh = getOctokit(true)
    const parsed = parseGithubRepo(repoUrl)
    if (!parsed) {
      return NextResponse.json({ error: 'Repository URL is not a GitHub repo' }, { status: 400 })
    }
    if (!gh) {
      return NextResponse.json({ error: 'GITHUB_TOKEN is not configured on the server' }, { status: 400 })
    }
    if (!title || typeof title !== 'string') return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    const res = await gh.issues.create({ owner: parsed.owner, repo: parsed.repo, title, body: typeof body === 'string' ? body : '', labels: Array.isArray(labels) ? labels : undefined })
    const htmlUrl = (res.data as any)?.html_url as string | undefined
    return NextResponse.json({ url: htmlUrl || `${repoUrl}/issues` })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    const message = typeof e?.message === 'string' ? e.message : 'Failed to create issue'
    return NextResponse.json({ error: message, status }, { status: status === 404 ? 502 : status })
  }
}
