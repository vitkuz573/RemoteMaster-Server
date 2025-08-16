import fs from 'node:fs'
import path from 'node:path'

type Pkg = {
  name?: string
  version?: string
  engines?: { node?: string }
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const pickVersion = (pkg: Pkg, dep: string) => pkg.dependencies?.[dep] || pkg.devDependencies?.[dep] || '—'

export async function PackageInfo() {
  try {
    const p = path.join(process.cwd(), 'package.json')
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8')) as Pkg

    const groups: { title: string; items: { label: string; value: string }[] }[] = [
      {
        title: 'App',
        items: [
          { label: 'name', value: pkg.name || '—' },
          { label: 'version', value: pkg.version || '—' },
        ],
      },
      {
        title: 'Runtime',
        items: [
          { label: 'node', value: pkg.engines?.node || '—' },
        ],
      },
      {
        title: 'Framework',
        items: [
          { label: 'next', value: pickVersion(pkg, 'next') },
          { label: 'react', value: pickVersion(pkg, 'react') },
          { label: 'next-intl', value: pickVersion(pkg, 'next-intl') },
        ],
      },
      {
        title: 'Tooling',
        items: [
          { label: 'typescript', value: pickVersion(pkg, 'typescript') },
          { label: 'eslint', value: pickVersion(pkg, 'eslint') },
          { label: 'tailwindcss', value: pickVersion(pkg, 'tailwindcss') },
        ],
      },
    ]

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <div key={g.title} className="rounded-md border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">{g.title}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <span key={it.label} className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="font-mono">{it.value}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  } catch {
    return null
  }
}
