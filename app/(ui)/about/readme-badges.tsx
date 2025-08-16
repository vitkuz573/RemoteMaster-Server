import fs from 'node:fs'
import path from 'node:path'

type Badge = { alt: string; src: string; href?: string }

function extractBadges(md: string): Badge[] {
  const block = md.match(/<!--\s*badges:start\s*-->[\s\S]*?<!--\s*badges:end\s*-->/i)
  const chunk = block ? block[0] : md.slice(0, 500) // fallback: try early README
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
  return out
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

