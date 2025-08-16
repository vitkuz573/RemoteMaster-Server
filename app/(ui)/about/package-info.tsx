import fs from 'node:fs'
import path from 'node:path'

type Pkg = {
  name?: string
  version?: string
  engines?: { node?: string }
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export async function PackageInfo() {
  try {
    const p = path.join(process.cwd(), 'package.json')
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8')) as Pkg
    const pick = (k: string) => pkg.dependencies?.[k] || pkg.devDependencies?.[k]
    const rows = [
      { k: 'app', v: `${pkg.name || ''}@${pkg.version || ''}`.trim() },
      { k: 'node', v: pkg.engines?.node || '—' },
      { k: 'next', v: pick('next') || '—' },
      { k: 'react', v: pick('react') || '—' },
      { k: 'next-intl', v: pick('next-intl') || '—' },
      { k: 'typescript', v: pick('typescript') || '—' },
    ]
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {rows.map(({k, v}) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-mono">{v}</span>
          </div>
        ))}
      </div>
    )
  } catch {
    return null
  }
}

