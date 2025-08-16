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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className="rounded-md border p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">{g.title}</div>
            <div className="space-y-1.5">
              {g.items.map((it) => (
                <div key={it.label} className="grid grid-cols-[100px_1fr] gap-2 items-baseline">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{it.label}</div>
                  <div className="font-mono text-sm break-words">{it.value}</div>
                </div>
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
