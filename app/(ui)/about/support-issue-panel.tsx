"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { buildIssueBody, buildIssueTitle, buildIssueUrl, mdToHtml, type IssueTemplate, type BuildIssueOptions } from './support-issue-utils'

export function SupportIssuePanel({ repo }: { repo: { type?: string | null; url?: string | null } }) {
  const [template, setTemplate] = useState<IssueTemplate>('support')
  const [includeEnv, setIncludeEnv] = useState(true)
  const [includeEndpoints, setIncludeEndpoints] = useState(true)
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true)
  const [includeSnapshot, setIncludeSnapshot] = useState(true)
  const [includeFlags, setIncludeFlags] = useState(true)
  const [includeToggles, setIncludeToggles] = useState(true)
  const [repoLabels, setRepoLabels] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [titleOverride, setTitleOverride] = useState<string>('')
  const [extra, setExtra] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState('')
  const [steps, setSteps] = useState('')
  const [expected, setExpected] = useState('')
  const [actual, setActual] = useState('')
  const [motivation, setMotivation] = useState('')
  const [proposal, setProposal] = useState('')
  const [alternatives, setAlternatives] = useState('')

  // Collect diagnostics payload from globals exposed in About
  const payload = useMemo<Record<string, unknown>>(() => {
    try {
      const el = document.querySelector('[data-about-diagnostics]') as HTMLElement | null
      if (el?.dataset.payload) return JSON.parse(el.dataset.payload)
    } catch {}
    return {}
  }, [])

  const title = (titleOverride && titleOverride.trim().length > 0) ? titleOverride : buildIssueTitle(payload, template)
  const opts: BuildIssueOptions = { template, includeEnv, includeEndpoints, includeDiagnostics, includeSnapshot, includeFlags, includeToggles, extra, summary, steps, expected, actual, motivation, proposal, alternatives }
  const body = buildIssueBody(payload, opts)
  const labelsArr = [template, ...labels.split(',').map((s) => s.trim()).filter(Boolean)]
  const url = buildIssueUrl(repo, { title, body, labels: labelsArr })
  const urlLen = url.length
  const urlStatus: 'ok' | 'warn' | 'bad' = urlLen < 4000 ? 'ok' : urlLen < 8000 ? 'warn' : 'bad'

  const openAdaptive = async () => {
    if (urlStatus === 'bad') {
      try { await navigator.clipboard?.writeText(`# ${title}\n\n${body}`) } catch {}
      const minimal = buildIssueUrl(repo, { title, body: '_Body is long. Pasted from clipboard._', labels: labelsArr })
      window.open(minimal, '_blank', 'noopener,noreferrer')
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Fetch repo labels once
  useEffect(() => {
    let alive = true
    fetch('/api/repo-labels', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j: { labels: string[] }) => { if (alive) setRepoLabels(j.labels || []) })
      .catch(() => { if (alive) setRepoLabels([]) })
    return () => { alive = false }
  }, [])

  return (
    <div className="rounded-md border p-3 lg:p-4">
      <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Template</span>
          <Select value={template} onValueChange={(v) => setTemplate(v as IssueTemplate)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground">Title</span>
          <input value={titleOverride} onChange={(e) => setTitleOverride(e.target.value)} placeholder={title}
            className="h-8 w-full rounded border px-2 text-xs bg-background" />
        </div>
        <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeEnv} onCheckedChange={(v) => setIncludeEnv(Boolean(v))} /> Env
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeEndpoints} onCheckedChange={(v) => setIncludeEndpoints(Boolean(v))} /> Endpoints
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeSnapshot} onCheckedChange={(v) => setIncludeSnapshot(Boolean(v))} /> Snapshot
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeFlags} onCheckedChange={(v) => setIncludeFlags(Boolean(v))} /> Flags
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeToggles} onCheckedChange={(v) => setIncludeToggles(Boolean(v))} /> Toggles
          </label>
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox checked={includeDiagnostics} onCheckedChange={(v) => setIncludeDiagnostics(Boolean(v))} /> Diagnostics
          </label>
        </div>
        <div className="lg:col-span-3 grid gap-2">
          {template === 'bug' && (
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Summary</span>
                <input value={summary} onChange={(e) => setSummary(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Steps (one per line)</span>
                <textarea rows={3} value={steps} onChange={(e) => setSteps(e.target.value)} className="rounded border px-2 py-1 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Expected</span>
                <input value={expected} onChange={(e) => setExpected(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Actual</span>
                <input value={actual} onChange={(e) => setActual(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
            </div>
          )}
          {template === 'feature' && (
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Summary</span>
                <input value={summary} onChange={(e) => setSummary(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Motivation</span>
                <input value={motivation} onChange={(e) => setMotivation(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Proposal</span>
                <input value={proposal} onChange={(e) => setProposal(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Alternatives</span>
                <input value={alternatives} onChange={(e) => setAlternatives(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
            </div>
          )}
          {template === 'support' && (
            <div className="grid gap-2">
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Summary</span>
                <input value={summary} onChange={(e) => setSummary(e.target.value)} className="h-8 rounded border px-2 text-xs bg-background" />
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Context</span>
                <textarea rows={3} value={steps} onChange={(e) => setSteps(e.target.value)} className="rounded border px-2 py-1 text-xs bg-background" />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Labels</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">Pick labels</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Repository labels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {repoLabels.length ? repoLabels.map((l) => (
                <DropdownMenuCheckboxItem key={l} checked={selectedLabels.includes(l)} onCheckedChange={(v) => {
                  setSelectedLabels((prev) => v ? Array.from(new Set([...prev, l])) : prev.filter((x) => x !== l))
                }}>{l}</DropdownMenuCheckboxItem>
              )) : (<div className="px-2 py-1 text-xs text-muted-foreground">No labels</div>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex flex-wrap gap-1">
            {selectedLabels.map((l) => (
              <Badge key={l} variant="secondary">{l}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 lg:justify-end lg:col-span-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">Preview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Issue preview</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="md" className="w-full">
                <TabsList>
                  <TabsTrigger value="md">Markdown</TabsTrigger>
                  <TabsTrigger value="rendered">Rendered</TabsTrigger>
                </TabsList>
                <TabsContent value="md">
                  <pre className="rounded-md border p-3 text-xs whitespace-pre-wrap break-words max-h-[60vh] overflow-auto"># {title}{"\n\n"}{body}</pre>
                </TabsContent>
                <TabsContent value="rendered">
                  <div className="rounded-md border p-3 text-sm max-h-[60vh] overflow-auto" dangerouslySetInnerHTML={{ __html: mdToHtml(`# ${title}\n\n${body}`) }} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <div className={urlStatus === 'bad' ? 'text-destructive text-xs px-2' : urlStatus==='warn' ? 'text-amber-600 text-xs px-2' : 'text-muted-foreground text-xs px-2'} title={`URL length: ${urlLen}`}>
            URL: {urlLen} {urlStatus==='bad' ? '(too long; fallback will copy body)' : urlStatus==='warn' ? '(long)' : ''}
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => { navigator.clipboard?.writeText(title) }}>Copy title</Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => { navigator.clipboard?.writeText(`# ${title}\n\n${body}`) }}>Copy Markdown</Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => {
            const blob = new Blob([`# ${title}\n\n${body}`], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'issue.md'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }}>Download .md</Button>
          <Button className="h-8" onClick={openAdaptive}>Open Issue</Button>
        </div>
      </div>
      <div className="mt-2">
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Additional context (optional)" rows={3}
          className="w-full rounded border px-2 py-1 text-xs bg-background" />
      </div>
    </div>
  )
}
