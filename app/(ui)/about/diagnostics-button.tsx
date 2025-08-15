"use client"

import { Button } from '@/components/ui/button'

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  )
}

export function DiagnosticsButton({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex items-center gap-2">
      <CopyButton payload={data} />
    </div>
  )
}

function CopyButton({ payload }: { payload: unknown }) {
  return (
    <Button
      variant="outline"
      className="inline-flex items-center gap-2"
      onClick={async () => {
        try {
          const text = JSON.stringify(payload, null, 2)
          await navigator.clipboard.writeText(text)
          const el = document.getElementById('copy-icon')
          if (el) {
            el.classList.add('hidden')
            const ok = document.getElementById('check-icon')
            ok?.classList.remove('hidden')
            setTimeout(() => { ok?.classList.add('hidden'); el.classList.remove('hidden') }, 1200)
          }
        } catch {
          // no-op
        }
      }}
    >
      <ClipboardIcon id="copy-icon" className="size-4" />
      <CheckIcon id="check-icon" className="size-4 hidden" />
      Copy diagnostics
    </Button>
  )
}

