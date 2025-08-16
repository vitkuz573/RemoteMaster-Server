import fs from 'node:fs'
import path from 'node:path'

export async function MdSummary({ file, title }: { file: string; title: string }) {
  try {
    const p = path.join(process.cwd(), file)
    const md = fs.readFileSync(p, 'utf8')
    const para = md.split(/\r?\n\r?\n/)[0]
    const lines = para.split(/\r?\n/).slice(0, 8)
    const text = lines.join(' ')
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

