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

export function getOctokit(requireAuth = false): Octokit | null {
  // For write operations (issues), require a token; for read operations, allow unauthenticated
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null
  if (requireAuth && !token) return null
  try {
    return new Octokit(token ? { auth: token } : {})
  } catch {
    return null
  }
}
