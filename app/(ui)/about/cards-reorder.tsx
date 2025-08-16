"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical, LayoutTemplate } from 'lucide-react'

function getScopes(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-cards-scope]'))
}
function getCards(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>('[data-card-id]'))
}
function loadOrder(scopeId: string): string[] | null {
  try { return JSON.parse(localStorage.getItem(`about:order:${scopeId}`) || 'null') } catch { return null }
}
function saveOrder(scopeId: string, ids: string[]) {
  try { localStorage.setItem(`about:order:${scopeId}`, JSON.stringify(ids)) } catch {}
}
function loadHidden(scopeId: string): string[] {
  try { return JSON.parse(localStorage.getItem(`about:hidden:${scopeId}`) || '[]') } catch { return [] }
}
function saveHidden(scopeId: string, ids: string[]) {
  try { localStorage.setItem(`about:hidden:${scopeId}`, JSON.stringify(ids)) } catch {}
}

function applyVisibility(scope: HTMLElement, hidden: string[]) {
  const cards = getCards(scope)
  cards.forEach((el) => {
    const id = el.getAttribute('data-card-id') || ''
    ;(el.style as any).display = hidden.includes(id) ? 'none' : ''
  })
}

function registry(scope: HTMLElement) {
  return getCards(scope).map((el) => ({ id: el.getAttribute('data-card-id') || '', title: el.getAttribute('data-card-title') || (el.querySelector('[data-slot=card-title]')?.textContent || '') }))
}

export function CardsReorderToolbar() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Apply saved order on mount
    const scopes = getScopes()
    for (const scope of scopes) {
      const id = scope.getAttribute('data-cards-scope') || 'default'
      const order = loadOrder(id)
      if (order && order.length) {
        const map = new Map(getCards(scope).map((el) => [el.getAttribute('data-card-id') || '', el]))
        for (const cardId of order) {
          const el = map.get(cardId)
          if (el) scope.appendChild(el)
        }
      }
      const hidden = loadHidden(id)
      applyVisibility(scope, hidden)
    }
  }, [])

  useEffect(() => {
    const scopes = getScopes()
    const cleanups: Array<() => void> = []
    if (!enabled) return () => {}
    for (const scope of scopes) {
      const id = scope.getAttribute('data-cards-scope') || 'default'
      const cards = getCards(scope)
      cards.forEach((el) => {
        el.setAttribute('draggable', 'true')
        el.classList.add('cursor-move')
      })
      let dragging: HTMLElement | null = null
      const onDragStart = (e: DragEvent) => {
        const target = (e.target as HTMLElement)?.closest('[data-card-id]') as HTMLElement | null
        if (!target) return
        dragging = target
        e.dataTransfer?.setData('text/plain', target.getAttribute('data-card-id') || '')
        e.dataTransfer?.setDragImage(target, 10, 10)
      }
      const onDragOver = (e: DragEvent) => {
        if (!dragging) return
        e.preventDefault()
        const over = (e.target as HTMLElement)?.closest('[data-card-id]') as HTMLElement | null
        if (!over || over === dragging) return
        const rect = over.getBoundingClientRect()
        const before = (e.clientY - rect.top) < rect.height / 2
        if (before) scope.insertBefore(dragging, over)
        else scope.insertBefore(dragging, over.nextSibling)
      }
      const onDrop = (_e: DragEvent) => {
        dragging = null
        const ids = getCards(scope).map((el) => el.getAttribute('data-card-id') || '')
        saveOrder(id, ids)
      }
      scope.addEventListener('dragstart', onDragStart)
      scope.addEventListener('dragover', onDragOver)
      scope.addEventListener('drop', onDrop)
      cleanups.push(() => {
        scope.removeEventListener('dragstart', onDragStart)
        scope.removeEventListener('dragover', onDragOver)
        scope.removeEventListener('drop', onDrop)
        const cards2 = getCards(scope)
        cards2.forEach((el) => {
          el.removeAttribute('draggable')
          el.classList.remove('cursor-move')
        })
      })
    }
    return () => { cleanups.forEach((fn) => fn()) }
  }, [enabled])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={enabled ? 'default' : 'outline'} size="sm" className="h-7 px-2" onClick={() => setEnabled((v) => !v)}>
              <GripVertical className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{enabled ? 'Reorder: on' : 'Reorder: off'}</TooltipContent>
        </Tooltip>
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <LayoutTemplate className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Manage widgets</TooltipContent>
          </Tooltip>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Manage widgets</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getScopes().map((scope) => {
                const id = scope.getAttribute('data-cards-scope') || 'default'
                const items = registry(scope)
                const hidden = new Set(loadHidden(id))
                const toggle = (cardId: string, on: boolean) => {
                  const arr = Array.from(hidden)
                  const next = on ? arr.filter((x) => x !== cardId) : [...new Set([...arr, cardId])]
                  saveHidden(id, next)
                  applyVisibility(scope, next)
                }
                const reset = () => {
                  saveHidden(id, [])
                  applyVisibility(scope, [])
                }
                return (
                  <div key={id} className="rounded-md border">
                    <div className="px-3 py-2 text-xs text-muted-foreground">Scope: {id}</div>
                    <div className="divide-y">
                      {items.map((it) => {
                        const isHidden = hidden.has(it.id)
                        return (
                          <label key={it.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                            <span className="truncate">{it.title || it.id}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{isHidden ? 'Hidden' : 'Shown'}</span>
                              <Checkbox checked={!isHidden} onCheckedChange={(v) => toggle(it.id, Boolean(v))} />
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-3 py-2">
                      <Button variant="outline" size="sm" className="h-7 px-2" onClick={reset}>Reset scope</Button>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => {
                  getScopes().forEach((scope) => { const id = scope.getAttribute('data-cards-scope') || 'default'; saveHidden(id, []); applyVisibility(scope, []) })
                }}>Reset all</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
