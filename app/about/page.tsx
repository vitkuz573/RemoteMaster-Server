import { appConfig } from '@/lib/app-config';

export default function AboutPage() {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">About {appConfig.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Version" value={appConfig.version} link={appConfig.versionUrl ?? undefined} />
        <Info label="Build" value={appConfig.buildInfo} link={appConfig.commitUrl ?? undefined} />
        <Info label="Branch" value={appConfig.buildBranch} link={appConfig.branchUrl ?? undefined} />
        <Info label="Build Date" value={appConfig.buildDate} />
        <Info label="Environment" value={appConfig.environment} />
        <Info label="API" value={appConfig.endpoints.api} />
      </div>
    </div>
  );
}

function Info({ label, value, link }: { label: string; value: string; link?: string }) {
  const content = (
    <>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-sm break-all">{value}</div>
    </>
  );
  return (
    <div className="rounded-md border p-3">
      {link ? (
        <a href={link} target="_blank" rel="noreferrer noopener" className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

