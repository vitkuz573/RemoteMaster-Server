"use client"

import { Button } from '@/components/ui/button'
import { useEndpointsContext } from '@/contexts/endpoints-context'
import { RefreshCw } from 'lucide-react'

export function EndpointsHeaderControls() {
  const { intervalSec, setIntervalSec, remaining, runAll, summary } = useEndpointsContext()

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => runAll && runAll()}>
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
      <div className="text-xs text-muted-foreground">
        {summary.ok}/{summary.total} OK{summary.worstMs != null ? ` · worst ${summary.worstMs} ms` : ''}
      </div>
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

