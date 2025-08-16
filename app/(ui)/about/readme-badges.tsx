import fs from 'node:fs'
import path from 'node:path'
import { appConfig } from '@/lib/app-config'

type Badge = { alt: string; src: string; href?: string }

function extractBadges(md: string): Badge[] {
  const block = md.match(/<!--\s*badges:start\s*-->[\s\S]*?<!--\s*badges:end\s*-->/i)
  if (!block) return []
  const chunk = block[0]
  const out: Badge[] = []
  const reLinked = /\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)/g
  const rePlain = /!\[(.*?)\]\((.*?)\)/g
  let m: RegExpExecArray | null
  while ((m = reLinked.exec(chunk))) {
    const [, alt, src, href] = m
    out.push({ alt, src, href })
  }
  // Include plain images that aren't already captured
  while ((m = rePlain.exec(chunk))) {
    const [, alt, src] = m
    if (!out.some((b) => b.src === src)) out.push({ alt, src })
  }
  return transformBadges(out)
}

function transformBadges(list: Badge[]): Badge[] {
  const branch = appConfig.repository.branch || 'main'
  const repoUrl = appConfig.repository.url || ''
  let owner: string | undefined
  let repo: string | undefined
  try {
    const u = new URL(repoUrl)
    if (u.hostname === 'github.com') {
      const parts = u.pathname.replace(/^\//,'').split('/')
      owner = parts[0]
      repo = parts[1]
    }
  } catch {}

  return list.map((b) => {
    try {
      const u = new URL(b.src)
      // Rewrite GitHub Actions badge to shields
      if (u.hostname === 'github.com' && /\/actions\/workflows\/.+\/badge\.svg$/.test(u.pathname) && owner && repo) {
        const workflow = u.pathname.split('/').slice(-2, -1)[0]
        return {
          alt: b.alt || 'CI',
          src: `https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/${workflow}?branch=${encodeURIComponent(branch)}`,
          href: b.href,
        }
      }
      // Rewrite Codecov badge to shields
      if (u.hostname === 'codecov.io' && /\/gh\/.+\/branch\/.+\/graph\/badge\.svg$/.test(u.pathname) && owner && repo) {
        return {
          alt: b.alt || 'codecov',
          src: `https://img.shields.io/codecov/c/github/${owner}/${repo}/${encodeURIComponent(branch)}`,
          href: b.href,
        }
      }
    } catch {}
    return b
  })
}

export async function ReadmeBadges() {
  try {
    const file = path.join(process.cwd(), 'README.md')
    const md = fs.readFileSync(file, 'utf8')
    const badges = extractBadges(md)
    if (!badges.length) return null
    return (
      <div className="flex flex-wrap gap-2 pb-2">
        {badges.map((b, i) => (
          b.href ? (
            <a key={i} href={b.href} target="_blank" rel="noreferrer noopener">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={b.alt} className="h-5" />
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={b.src} alt={b.alt} className="h-5" />
          )
        ))}
      </div>
    )
  } catch {
    return null
  }
}
