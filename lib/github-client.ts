import { Octokit } from '@octokit/rest'
import { appConfig } from './app-config'

export function parseGithubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.hostname.includes('github.com')) return null
    const parts = u.pathname.replace(/^\//, '').split('/')
    const owner = parts[0]
    const repo = (parts[1] || '').replace(/\.git$/, '')
    if (!owner || !repo) return null
    return { owner, repo }
  } catch {
    return null
  }
}

export function getOctokit(): Octokit | null {
  // Use server-side token if present; fall back to unauthenticated client (public rate limits)
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null
  try {
    return new Octokit(token ? { auth: token } : {})
  } catch {
    return null
  }
}

