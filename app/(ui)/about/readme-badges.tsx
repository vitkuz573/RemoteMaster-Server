import badges from '@/lib/generated/readme-badges.json'

export async function ReadmeBadges() {
  if (!Array.isArray(badges) || badges.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {badges.map((b: any, i: number) => (
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
}
