import Link from 'next/link'
import { appConfig } from '@/lib/app-config'
import type { Metadata } from 'next'
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
import { ReadmeBadges } from './readme-badges'
import { OperationalToggles } from './operational-toggles'
import { getTranslations } from 'next-intl/server'
import { TimeSync } from './time-sync'
import { SentryTest } from './sentry-test'
import { ConfigAdvisor } from './config-advisor'
import { StatusPanel } from './status-panel'
import { CurlSnippets as CurlBlock } from './curl-snippets'
import { EndpointActions } from './endpoint-actions'
import { OpenIssueDiagnostics } from './open-issue-diagnostics'
import { OverallStatus } from './overall-status'
import { CurlSnippets } from './curl-snippets'

export const metadata: Metadata = {
  title: `About ${appConfig.name}`,
  description: `${appConfig.description} – build and support information`,
  openGraph: {
    title: `About ${appConfig.name}`,
    description: `${appConfig.description}`,
    url: '/about',
    siteName: appConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `About ${appConfig.name}`,
    description: `${appConfig.description}`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function AboutPage() {
  const t = await getTranslations('common')
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
          <div className="mt-3">
            <ConfigAdvisor />
          </div>
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
            <CardTitle>{t('build')}</CardTitle>
            <CardDescription>{t('build_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((it) => (
              <Info key={it.label} label={it.label} value={it.value} link={it.href} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('support')}</CardTitle>
            <CardDescription>{t('support_desc')}</CardDescription>
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
            <CardTitle>{t('links')}</CardTitle>
            <CardDescription>{t('links_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ReadmeBadges />
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
        <Card>
          <CardHeader>
            <CardTitle>Status summary</CardTitle>
            <CardDescription>Aggregated status of key endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <OverallStatus />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status summary</CardTitle>
            <CardDescription>Aggregated status of key endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPanel />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time sync</CardTitle>
            <CardDescription>Client vs server time offset</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSync />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('client_env')}</CardTitle>
            <CardDescription>{t('client_env_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientEnvironment />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('feature_flags')}</CardTitle>
            <CardDescription>{t('feature_flags_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureFlags />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('operational_toggles')}</CardTitle>
            <CardDescription>{t('operational_toggles_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <OperationalToggles />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('operational_checks')}</CardTitle>
            <CardDescription>{t('operational_checks_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <EndpointChecks />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('endpoints')}</CardTitle>
            <CardDescription>{t('endpoints_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <KeyValue label="API" value={displayUrl(appConfig.endpoints.api)} link={appConfig.endpoints.api} />
              <EndpointActions url={appConfig.endpoints.api} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <KeyValue label="Status" value={displayUrl(appConfig.endpoints.status)} link={appConfig.endpoints.status} />
              <EndpointActions url={appConfig.endpoints.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <KeyValue label="Health" value={displayUrl(appConfig.endpoints.health)} link={appConfig.endpoints.health} />
              <EndpointActions url={appConfig.endpoints.health} />
            </div>
            <div className="pt-2">
              <CurlBlock />
            </div>
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
            <CardTitle>{t('performance')}</CardTitle>
            <CardDescription>{t('performance_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <WebVitalsWidget />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t('support_bundle')}</CardTitle>
            <CardDescription>{t('support_bundle_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 flex-wrap">
              <SupportBundleButton />
              <OpenIssueDiagnostics repoUrl={appConfig.repository.url} payload={{
                name: appConfig.name,
                version: appConfig.version,
                build: appConfig.buildInfo,
                branch: appConfig.buildBranch,
                date: appConfig.buildDate,
                environment: appConfig.environment,
                endpoints: appConfig.endpoints,
              }} />
            </div>
            <div className="mt-4">
              <SentryTest />
            </div>
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

// fallback util (kept if needed elsewhere)

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
