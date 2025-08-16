"use client"

import { useMemo, useState } from 'react'
import { appConfig } from '@/lib/app-config'
import { Button } from '@/components/ui/button'

function CopyButton({ text }: { text: string }) {
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {}
  }
  return (
    <Button variant="outline" size="sm" onClick={onCopy}>Copy</Button>
  )
}

export function CurlSnippets() {
  const [shell, setShell] = useState<'bash'|'powershell'>('bash')
  const cmds = useMemo(() => {
    const api = appConfig.endpoints.api
    const health = appConfig.endpoints.health
    const status = appConfig.endpoints.status
    const list: {label:string;cmd:string}[] = []
    if (shell === 'bash') {
      if (api) list.push({ label: 'API HEAD', cmd: `curl -I ${api}` })
      if (api) list.push({ label: 'API timing', cmd: `curl -s -o /dev/null -w "HTTP:%{http_code} TIME_TOTAL:%{time_total}s" ${api}` })
      if (health) list.push({ label: 'Health GET', cmd: `curl -s ${health}` })
      if (status) list.push({ label: 'Status GET', cmd: `curl -s ${status}` })
    } else {
      if (api) list.push({ label: 'API HEAD', cmd: `iwr -Method Head ${api}` })
      if (api) list.push({ label: 'API timing', cmd: `$r = Measure-Command { iwr -UseBasicParsing ${api} | Out-Null }; Write-Output ("TIME_TOTAL:{0}s" -f $r.TotalSeconds)` })
      if (health) list.push({ label: 'Health GET', cmd: `iwr -UseBasicParsing ${health}` })
      if (status) list.push({ label: 'Status GET', cmd: `iwr -UseBasicParsing ${status}` })
    }
    return list
  }, [shell])

  if (cmds.length === 0) return null
  const repo = appConfig.repository.url
  const issueBody = '```\n' + cmds.map(c=>`# ${c.label}\n${c.cmd}`).join('\n\n') + '\n```'
  const issueUrl = repo ? `${repo}/issues/new?title=${encodeURIComponent('[Support] Endpoint checks via CLI')}&body=${encodeURIComponent(issueBody)}` : null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span>Shell:</span>
        <Button size="sm" variant={shell==='bash'?'default':'outline'} onClick={()=>setShell('bash')}>Bash</Button>
        <Button size="sm" variant={shell==='powershell'?'default':'outline'} onClick={()=>setShell('powershell')}>PowerShell</Button>
        {issueUrl ? (
          <a className="ml-2 underline" href={issueUrl} target="_blank" rel="noreferrer noopener">Open issue with snippets</a>
        ) : null}
      </div>
      {cmds.map((c) => (
        <div key={c.label} className="rounded-md border p-3">
          <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
            <span>{c.label}</span>
            <CopyButton text={c.cmd} />
          </div>
          <pre className="text-xs overflow-x-auto"><code>{c.cmd}</code></pre>
        </div>
      ))}
    </div>
  )
}
