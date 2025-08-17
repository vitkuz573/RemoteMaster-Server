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
import { SupportIssuePanel } from './support-issue-panel'
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
import { BuildInfoCompare } from './build-info-compare'
import { FullDiagnostics } from './full-diagnostics'
import { MdSummary } from './md-summary'
import { PackageInfo } from './package-info'
import { NpmVersions } from './npm-versions'
import { EndpointHeaders } from './endpoint-headers'
import { StorageQuota } from './storage-quota'
import { OverallStatus } from './overall-status'
import { CurlSnippets } from './curl-snippets'
import { EndpointsTable } from './endpoints-table'
import { EndpointsCardProvider } from './endpoints-provider'
import { EndpointsHeaderControls } from './endpoints-header-controls'
import { CardAction } from '@/components/ui/card'
import { CardsReorderToolbar } from './cards-reorder'
// Tabs not used here anymore for Links

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

      <div className="flex items-center justify-end mb-2">
        <CardsReorderToolbar />
      </div>
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-cards-scope="about-top">
        <Card className="md:col-span-2 lg:col-span-3" data-card-id="versions" data-card-title="Versions">
          <CardHeader>
            <CardTitle>Versions</CardTitle>
            <CardDescription>App, runtime, framework and tooling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <BuildInfoCompare />
            </div>
            <div className="mb-3">
              <NpmVersions />
            </div>
            {/* @ts-expect-error Server Component */}
            <PackageInfo />
          </CardContent>
        </Card>

        <Card data-card-id="build" data-card-title="Build">
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

        <Card data-card-id="support" data-card-title="Support">
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
            {/* Summaries from repository files (if present) */}
            {/* @ts-expect-error Server Component */}
            <MdSummary file={'SECURITY.md'} title={'Security policy (summary)'} />
            {/* @ts-expect-error Server Component */}
            <MdSummary file={'SUPPORT.md'} title={'Support (summary)'} />
          </CardContent>
        </Card>

        <Card data-card-id="links" data-card-title="Links">
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
          </CardContent>
        </Card>
        {appConfig.repository.url ? (
          <Card data-card-id="issue-builder" data-card-title="Issue Builder" className="col-span-full">
            <CardHeader>
              <CardTitle>Issue Builder</CardTitle>
              <CardDescription>Create a rich issue with diagnostics and snapshots</CardDescription>
            </CardHeader>
            <CardContent>
              <SupportIssuePanel
                repo={{ type: appConfig.repository.type, url: appConfig.repository.url }}
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
            </CardContent>
          </Card>
        ) : null}
        <Card data-card-id="overall-status" data-card-title="Operational checks">
          <CardHeader>
            <CardTitle>{t('operational_checks')}</CardTitle>
            <CardDescription>{t('operational_checks_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <OverallStatus />
          </CardContent>
        </Card>
        <Card data-card-id="status-panel" data-card-title="Status panel">
          <CardHeader>
            <CardTitle>{t('status_summary_title')}</CardTitle>
            <CardDescription>{t('status_summary_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPanel />
          </CardContent>
        </Card>
      </section>

      <Separator />
      <section className="grid gap-6 md:grid-cols-2" data-cards-scope="about-mid">
        <Card data-card-id="time-sync" data-card-title="Time sync">
          <CardHeader>
            <CardTitle>{t('time_sync_title')}</CardTitle>
            <CardDescription>{t('time_sync_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSync />
          </CardContent>
        </Card>
        <Card data-card-id="client-env" data-card-title="Client environment">
          <CardHeader>
            <CardTitle>{t('client_env')}</CardTitle>
            <CardDescription>{t('client_env_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientEnvironment />
            <div className="mt-2">
              <StorageQuota />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full" data-card-id="feature-flags" data-card-title="Feature flags">
          <CardHeader>
            <CardTitle>{t('feature_flags')}</CardTitle>
            <CardDescription>{t('feature_flags_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureFlags />
          </CardContent>
        </Card>

        <Card className="col-span-full" data-card-id="operational-toggles" data-card-title="Operational toggles">
          <CardHeader>
            <CardTitle>{t('operational_toggles')}</CardTitle>
            <CardDescription>{t('operational_toggles_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <OperationalToggles />
          </CardContent>
        </Card>

        <EndpointsCardProvider>
          <Card className="col-span-full" data-card-id="endpoints" data-card-title="Endpoints">
            <CardHeader>
              <CardTitle>{t('endpoints')}</CardTitle>
              <CardDescription>{t('endpoints_desc')}</CardDescription>
              <CardAction>
                <EndpointsHeaderControls />
              </CardAction>
            </CardHeader>
            <CardContent>
              <EndpointsTable />
            </CardContent>
          </Card>
        </EndpointsCardProvider>
        <Card data-card-id="repository" data-card-title="Repository">
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

      <section data-cards-scope="about-bottom-1">
        <Card data-card-id="performance" data-card-title="Performance">
          <CardHeader>
            <CardTitle>{t('performance')}</CardTitle>
            <CardDescription>{t('performance_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <WebVitalsWidget />
          </CardContent>
        </Card>
      </section>

      <section data-cards-scope="about-bottom-2">
        <Card data-card-id="support-bundle" data-card-title="Support bundle">
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
              <FullDiagnostics />
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
