"use client"

import { Button } from '@/components/ui/button'
import { useEndpointsContext } from '@/contexts/endpoints-context'
import { RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EndpointsHeaderControls() {
  const { intervalSec, setIntervalSec, remaining, runAll, summary, group, setGroup, groups } = useEndpointsContext()

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runAll && runAll()}>
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
      <div className="text-xs text-muted-foreground">
        {summary.ok}/{summary.total} OK{summary.worstMs != null ? ` · worst ${summary.worstMs} ms` : ''}
      </div>
      {groups.length > 1 && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-xs text-muted-foreground">Group:</div>
          <Select value={group ?? 'all'} onValueChange={(v) => setGroup(v === 'all' ? null : v)}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {groups.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="hidden sm:flex items-center gap-1 text-xs">
        {[null, 5, 15, 60].map((sec, i) => (
          <Button key={String(sec ?? 'off')+i} variant={intervalSec===sec? 'default':'outline'} size="sm" className="h-7 px-2 text-xs" onClick={() => setIntervalSec(sec as any)}>
            {sec ? `${sec}s` : 'Off'}
          </Button>
        ))}
        {intervalSec ? <span className="text-muted-foreground">in {remaining}s</span> : null}
      </div>
    </div>
  )
}
