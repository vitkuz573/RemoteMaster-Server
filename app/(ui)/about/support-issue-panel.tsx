"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { buildIssueBody, buildIssueTitle, buildIssueUrl, type IssueTemplate } from './support-issue-utils'

export function SupportIssuePanel({ repo }: { repo: { type?: string | null; url?: string | null } }) {
  const [template, setTemplate] = useState<IssueTemplate>('support')
  const [includeEnv, setIncludeEnv] = useState(true)
  const [includeEndpoints, setIncludeEndpoints] = useState(true)
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true)
  const [includeLayout, setIncludeLayout] = useState(true)
  const [labels, setLabels] = useState<string>('')
  const [titleOverride, setTitleOverride] = useState<string>('')
  const [extra, setExtra] = useState<string>('')
  const [open, setOpen] = useState(false)

  // Collect diagnostics payload from globals exposed in About
  const payload = useMemo<Record<string, unknown>>(() => {
    try {
      const el = document.querySelector('[data-about-diagnostics]') as HTMLElement | null
      if (el?.dataset.payload) return JSON.parse(el.dataset.payload)
    } catch {}
    return {}
  }, [])

  const title = (titleOverride && titleOverride.trim().length > 0) ? titleOverride : buildIssueTitle(payload, template)
  const body = buildIssueBody(payload, { template, includeEnv, includeEndpoints, includeDiagnostics, extra })
  const labelsArr = [template, ...labels.split(',').map((s) => s.trim()).filter(Boolean)]
  const url = buildIssueUrl(repo, { title, body, labels: labelsArr })

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
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeEnv} onCheckedChange={(v) => setIncludeEnv(Boolean(v))} /> Env
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeEndpoints} onCheckedChange={(v) => setIncludeEndpoints(Boolean(v))} /> Endpoints
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeDiagnostics} onCheckedChange={(v) => setIncludeDiagnostics(Boolean(v))} /> Diagnostics
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeLayout} onCheckedChange={(v) => setIncludeLayout(Boolean(v))} disabled /> Layout
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Labels</span>
          <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="comma,separated"
            className="h-8 w-40 rounded border px-2 text-xs bg-background" />
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
              <div className="space-y-2">
                <div className="text-sm font-medium">{title}</div>
                <pre className="rounded-md border p-3 text-xs whitespace-pre-wrap break-words max-h-[60vh] overflow-auto">{body}</pre>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="h-8" onClick={() => { navigator.clipboard?.writeText(title) }}>Copy title</Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => { navigator.clipboard?.writeText(body) }}>Copy body</Button>
          <Button asChild className="h-8">
            <a href={url} target="_blank" rel="noreferrer noopener">Open Issue</a>
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Additional context (optional)" rows={3}
          className="w-full rounded border px-2 py-1 text-xs bg-background" />
      </div>
    </div>
  )
}
