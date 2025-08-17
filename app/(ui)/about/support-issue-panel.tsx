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
  const [open, setOpen] = useState(false)

  // Collect diagnostics payload from globals exposed in About
  const payload = useMemo<Record<string, unknown>>(() => {
    try {
      const el = document.querySelector('[data-about-diagnostics]') as HTMLElement | null
      if (el?.dataset.payload) return JSON.parse(el.dataset.payload)
    } catch {}
    return {}
  }, [])

  const title = buildIssueTitle(payload, template)
  const body = buildIssueBody(payload, { template, includeEnv, includeEndpoints, includeDiagnostics })
  const url = buildIssueUrl(repo, { title, body, labels: [template] })

  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-3">
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
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeEnv} onCheckedChange={(v) => setIncludeEnv(Boolean(v))} /> Env
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeEndpoints} onCheckedChange={(v) => setIncludeEndpoints(Boolean(v))} /> Endpoints
        </label>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={includeDiagnostics} onCheckedChange={(v) => setIncludeDiagnostics(Boolean(v))} /> Diagnostics
        </label>
        <div className="ml-auto flex items-center gap-2">
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
          <Button asChild>
            <a href={url} target="_blank" rel="noreferrer noopener">Open Issue</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

