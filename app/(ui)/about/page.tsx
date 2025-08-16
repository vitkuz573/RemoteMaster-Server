import Link from 'next/link'
import { appConfig } from '@/lib/app-config'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DiagnosticsButton } from './diagnostics-button'
import { EndpointChecks } from './endpoint-checks'
import { WebVitalsWidget } from './web-vitals-widget'
import { SupportIssueButton } from './support-issue-button'
import { ClientEnvironment } from './client-environment'
import { FeatureFlags } from './feature-flags'
import { SupportBundleButton } from './support-bundle-button'

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
            <ProjectBadges />
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <ExtLink href={l.href}>{l.label}</ExtLink>
                </li>
              ))}
            </ul>
            {appConfig.repository.type === 'github' && appConfig.repository.url ? (
              <div className="pt-4">
                <SupportIssueButton
                  repoUrl={appConfig.repository.url}
                  payload={{
                    name: appConfig.name,
                    version: appConfig.version,
                    build: appConfig.buildInfo,
                    branch: appConfig.buildBranch,
                    date: appConfig.buildDate,
                    environment: appConfig.environment,
                    endpoints: appConfig.endpoints,
                  }}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client environment</CardTitle>
            <CardDescription>Browser, locale, device</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientEnvironment />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature flags</CardTitle>
            <CardDescription>Runtime toggles</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureFlags />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational checks</CardTitle>
            <CardDescription>Live connectivity and latency</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointChecks />
          </CardContent>
        </Card>

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

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Performance (Web Vitals)</CardTitle>
            <CardDescription>Measured on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <WebVitalsWidget />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Support bundle</CardTitle>
            <CardDescription>Export diagnostics as JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportBundleButton />
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

function ProjectBadges() {
  const gh = githubInfo(appConfig.repository.url)
  if (!gh) return null
  const { owner, repo } = gh
  const branch = appConfig.repository.branch || 'main'
  const badges = [
    {
      alt: 'CI',
      src: `https://github.com/${owner}/${repo}/actions/workflows/ci.yml/badge.svg`,
      href: `https://github.com/${owner}/${repo}/actions/workflows/ci.yml`,
    },
    {
      alt: 'Codecov',
      src: `https://codecov.io/gh/${owner}/${repo}/branch/${branch}/graph/badge.svg`,
      href: `https://app.codecov.io/gh/${owner}/${repo}`,
    },
    {
      alt: 'OpenSSF Scorecard',
      src: `https://api.securityscorecards.dev/projects/github.com/${owner}/${repo}/badge`,
      href: `https://securityscorecards.dev/viewer/?uri=github.com/${owner}/${repo}`,
    },
  ]
  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {badges.map((b) => (
        <a key={b.alt} href={b.href} target="_blank" rel="noreferrer noopener">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} className="h-5" />
        </a>
      ))}
    </div>
  )
}

function githubInfo(url?: string) {
  try {
    if (!url) return null
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null
    const [owner, repo] = u.pathname.replace(/^\//,'').split('/')
    if (!owner || !repo) return null
    return { owner, repo }
  } catch { return null }
}

// Note: DiagnosticsButton is a client component (see ./diagnostics-button)
