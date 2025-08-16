import fs from 'node:fs'
import path from 'node:path'

function extractSummary(md: string): string | null {
  // Drop YAML front matter if present
  md = md.replace(/^---[\s\S]*?---\s*/m, '')
  // Split into paragraphs by blank lines
  const paras = md.split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean)
  // Helper: strip simple markdown formatting
  const strip = (s: string) => s
    .replace(/^\s*#+\s*/g, '') // heading marks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()

  // Pick the first non-heading, non-code, non-list paragraph
  for (const p of paras) {
    const firstLine = p.split(/\r?\n/)[0].trim()
    const isHeading = /^#+\s/.test(firstLine)
    const isCodeFence = /^```/.test(firstLine)
    const isList = /^[-*\d+\.]+\s+/.test(firstLine)
    if (isHeading || isCodeFence || isList) continue
    const text = strip(p).replace(/\s+/g, ' ')
    if (text && text.length > 0 && !/^#/.test(text)) {
      // Limit to ~400 chars
      return text.length > 400 ? text.slice(0, 400).trimEnd() + '…' : text
    }
  }
  // Fallback: take first paragraph even if heading, but stripped
  if (paras.length) {
    const t = strip(paras[0]).replace(/\s+/g, ' ')
    return t.length > 400 ? t.slice(0, 400).trimEnd() + '…' : t
  }
  return null
}

export async function MdSummary({ file, title }: { file: string; title: string }) {
  try {
    const p = path.join(process.cwd(), file)
    const md = fs.readFileSync(p, 'utf8')
    const text = extractSummary(md)
    if (!text) return null
    return (
      <div className="rounded-md border p-3 bg-muted/20">
        <div className="text-xs font-medium mb-1">{title}</div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    )
  } catch {
    return null
  }
}
