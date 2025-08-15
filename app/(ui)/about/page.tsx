import Link from 'next/link'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export const metadata = {
  title: `About ${appConfig.name}`,
  description: `${appConfig.description} – build and support information`,
}

export default function AboutPage() {
  const items: Array<{ label: string; value: string; href?: string }> = [
    { label: 'Version', value: appConfig.version, href: appConfig.versionUrl ?? undefined },
    { label: 'Build', value: appConfig.buildInfo, href: appConfig.commitUrl ?? undefined },
    { label: 'Branch', value: appConfig.buildBranch, href: appConfig.branchUrl ?? undefined },
    { label: 'Build Date', value: appConfig.buildDate },
    { label: 'Environment', value: appConfig.environment },
    { label: 'API', value: appConfig.endpoints.api },
  ]

  const links: Array<{ label: string; href?: string }> = [
    { label: 'Repository', href: appConfig.repository.url },
    { label: 'Documentation', href: appConfig.support.documentation },
    { label: 'Support', href: appConfig.support.website },
    { label: 'Status', href: appConfig.endpoints.status },
    { label: 'Health', href: appConfig.endpoints.health },
    { label: 'Security Policy', href: `${appConfig.repository.url}/security/policy` },
    { label: 'Code of Conduct', href: `${appConfig.repository.url}/blob/${appConfig.repository.branch}/CODE_OF_CONDUCT.md` },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">
            {appConfig.name}
            <Badge variant="secondary">{appConfig.buildVersion}</Badge>
            <Badge variant="outline" className="uppercase">{appConfig.environment}</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">{appConfig.description}</p>
        </div>
        <DiagnosticsButton
          data={{
            name: appConfig.name,
            version: appConfig.version,
            build: appConfig.buildInfo,
            branch: appConfig.buildBranch,
            date: appConfig.buildDate,
            environment: appConfig.environment,
            api: appConfig.endpoints.api,
            status: appConfig.endpoints.status,
            health: appConfig.endpoints.health,
          }}
        />
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Build</CardTitle>
            <CardDescription>Versioning and deployment metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((it) => (
              <Info key={it.label} label={it.label} value={it.value} link={it.href} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>How to get help</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValue label="Availability" value={appConfig.support.availability ?? '—'} />
            <KeyValue label="Response time" value={appConfig.support.responseTime ?? '—'} />
            <KeyValue label="Email" value={appConfig.support.email ?? '—'} link={mailto(appConfig.support.email)} />
            <KeyValue label="Phone" value={appConfig.support.phone || '—'} link={tel(appConfig.support.phone)} />
            <KeyValue label="Website" value={displayUrl(appConfig.support.website)} link={appConfig.support.website} />
            <KeyValue label="Docs" value={displayUrl(appConfig.support.documentation)} link={appConfig.support.documentation} />
            <KeyValue label="Community" value={displayUrl(appConfig.support.community)} link={appConfig.support.community} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>Project and status pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <ExtLink href={l.href}>{l.label}</ExtLink>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>Runtime service configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValue label="API" value={displayUrl(appConfig.endpoints.api)} link={appConfig.endpoints.api} />
            <KeyValue label="Status" value={displayUrl(appConfig.endpoints.status)} link={appConfig.endpoints.status} />
            <KeyValue label="Health" value={displayUrl(appConfig.endpoints.health)} link={appConfig.endpoints.health} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository</CardTitle>
            <CardDescription>Source and release references</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValue label="Repo" value={displayUrl(appConfig.repository.url)} link={appConfig.repository.url} />
            <KeyValue label="Branch" value={appConfig.repository.branch ?? '—'} link={appConfig.branchUrl ?? undefined} />
            <KeyValue label="Version tag" value={`v${appConfig.version}`} link={appConfig.versionUrl ?? undefined} />
            <KeyValue label="Commit" value={appConfig.buildInfo} link={appConfig.commitUrl ?? undefined} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function mailto(email?: string) {
  if (!email) return undefined
  return `mailto:${email}`
}
function tel(phone?: string) {
  if (!phone) return undefined
  return `tel:${phone}`
}
function displayUrl(url?: string) {
  if (!url) return '—'
  try { return new URL(url).host + new URL(url).pathname } catch { return url }
}

function Info({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-sm break-all">{value}</div>
    </div>
  )
  if (!link) return content
  return (
    <Link href={link} target="_blank" rel="noreferrer noopener" className="hover:underline">
      {content}
    </Link>
  )
}

function KeyValue({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {link ? (
        <Link href={link} target="_blank" rel="noreferrer noopener" className={cn('font-mono text-sm break-all hover:underline')}>
          {value}
        </Link>
      ) : (
        <div className="font-mono text-sm break-all">{value}</div>
      )}
    </div>
  )
}

function ExtLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <span className="text-muted-foreground">—</span>
  return (
    <Link href={href} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">
      {children}
    </Link>
  )
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  )
}

function DiagnosticsButton({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex items-center gap-2">
      <CopyButton payload={data} />
    </div>
  )
}

function CopyButton({ payload }: { payload: unknown }) {
  return (
    <Button
      variant="outline"
      className="inline-flex items-center gap-2"
      onClick={async () => {
        try {
          const text = JSON.stringify(payload, null, 2)
          await navigator.clipboard.writeText(text)
          const el = document.getElementById('copy-icon')
          if (el) {
            el.classList.add('hidden')
            const ok = document.getElementById('check-icon')
            ok?.classList.remove('hidden')
            setTimeout(() => { ok?.classList.add('hidden'); el.classList.remove('hidden') }, 1200)
          }
        } catch {
          // no-op
        }
      }}
    >
      <ClipboardIcon id="copy-icon" className="size-4" />
      <CheckIcon id="check-icon" className="size-4 hidden" />
      Copy diagnostics
    </Button>
  )
}
