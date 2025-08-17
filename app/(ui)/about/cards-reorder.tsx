"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical, LayoutTemplate } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

type SizesMap = Record<string, 'auto' | '1' | '2' | '3' | 'full'>
function loadSizes(scopeId: string): SizesMap {
  try { return JSON.parse(localStorage.getItem(`about:size:${scopeId}`) || '{}') } catch { return {} }
}
function saveSizes(scopeId: string, m: SizesMap) {
  try { localStorage.setItem(`about:size:${scopeId}`, JSON.stringify(m)) } catch {}
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

function applySizes(scope: HTMLElement, sizes: SizesMap) {
  getCards(scope).forEach((el) => {
    const id = el.getAttribute('data-card-id') || ''
    const size = sizes[id] || 'auto'
    if (size === 'auto') el.removeAttribute('data-card-user-size')
    else el.setAttribute('data-card-user-size', size)
  })
}

export function CardsReorderToolbar() {
  const [enabled, setEnabled] = useState(false)
  const [uiVersion, setUiVersion] = useState(0)
  const [open, setOpen] = useState(false)
  const [scopes, setScopes] = useState<{ id: string; el: HTMLElement; items: { id: string; title: string }[]; hidden: Set<string>; sizes: SizesMap }[]>([])

  function collectScopes() {
    const arr = getScopes().map((scope) => {
      const id = scope.getAttribute('data-cards-scope') || 'default'
      return {
        id,
        el: scope,
        items: registry(scope),
        hidden: new Set(loadHidden(id)),
        sizes: loadSizes(id),
      }
    })
    setScopes(arr)
  }

  useEffect(() => {
    if (!open) return
    // Delay to ensure page DOM is painted
    const t = setTimeout(() => collectScopes(), 0)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    collectScopes()
  }, [uiVersion, open])

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
      applySizes(scope, loadSizes(id))
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
      const overlays: HTMLElement[] = []
      const allowed = (sid: string) => sid === 'about-top' ? ['auto','1','2','3','full'] : (sid === 'about-mid' ? ['auto','1','2','full'] : ['auto','full'])
      const sizesMap = loadSizes(id)
      const setSizeQuick = (cardId: string, val: 'auto'|'1'|'2'|'3'|'full') => {
        const next = { ...sizesMap, [cardId]: val }
        saveSizes(id, next)
        applySizes(scope, next)
      }
      const shift = (arr: string[], cur: string, dir: 1|-1) => {
        const i = Math.max(0, arr.indexOf(cur))
        const j = Math.min(arr.length-1, Math.max(0, i + dir))
        return arr[j]
      }
      cards.forEach((el) => {
        el.classList.add('relative')
        const cardId = el.getAttribute('data-card-id') || ''
        const bar = document.createElement('div')
        bar.className = 'absolute top-2 right-2 z-10 flex items-center gap-1'
        const mkBtn = (label: string, title: string, onClick: () => void) => {
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'h-6 px-2 text-xs rounded border bg-background hover:bg-muted'
          b.title = title
          b.textContent = label
          b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick() })
          return b
        }
        const minus = mkBtn('-', 'Narrow', () => {
          const cur = (loadSizes(id)[cardId] || 'auto') as any
          const next = shift(allowed(id), cur, -1) as any
          setSizeQuick(cardId, next)
        })
        const plus = mkBtn('+', 'Widen', () => {
          const cur = (loadSizes(id)[cardId] || 'auto') as any
          const next = shift(allowed(id), cur, +1) as any
          setSizeQuick(cardId, next)
        })
        const full = mkBtn('Full', 'Full row', () => setSizeQuick(cardId, 'full'))
        bar.appendChild(minus); bar.appendChild(plus); bar.appendChild(full)
        el.appendChild(bar)
        overlays.push(bar)
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
          el.classList.remove('relative')
        })
        overlays.forEach((o) => o.remove())
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
        <Dialog open={open} onOpenChange={setOpen}>
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
              {scopes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No widgets detected.</div>
              ) : (
                scopes.map((scope) => {
                  const id = scope.id
                  const toggle = (cardId: string, on: boolean) => {
                    const arr = Array.from(scope.hidden)
                    const next = on ? arr.filter((x) => x !== cardId) : [...new Set([...arr, cardId])]
                    saveHidden(id, next)
                    applyVisibility(scope.el, next)
                    // update local state instantly
                    setScopes((prev) => prev.map((s) => s.id === id ? { ...s, hidden: new Set(next) } : s))
                    setUiVersion((v) => v + 1)
                  }
                  const setSize = (cardId: string, val: 'auto' | '1' | '2' | '3' | 'full') => {
                    const next = { ...scope.sizes, [cardId]: val }
                    saveSizes(id, next)
                    applySizes(scope.el, next)
                    setScopes((prev) => prev.map((s) => s.id === id ? { ...s, sizes: next } : s))
                    setUiVersion((v) => v + 1)
                  }
                  const reset = () => {
                    saveHidden(id, [])
                    applyVisibility(scope.el, [])
                    setScopes((prev) => prev.map((s) => s.id === id ? { ...s, hidden: new Set() } : s))
                    setUiVersion((v) => v + 1)
                  }
                  const resetSizes = () => {
                    saveSizes(id, {})
                    applySizes(scope.el, {})
                    setScopes((prev) => prev.map((s) => s.id === id ? { ...s, sizes: {} } : s))
                    setUiVersion((v) => v + 1)
                  }
                  return (
                    <div key={id} className="rounded-md border">
                      <div className="px-3 py-2 text-xs text-muted-foreground">Scope: {id}</div>
                      <div className="divide-y">
                        {scope.items.map((it) => {
                          const isHidden = scope.hidden.has(it.id)
                          return (
                            <div key={it.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                              <span className="truncate">{it.title || it.id}</span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{isHidden ? 'Hidden' : 'Shown'}</span>
                                  <Checkbox checked={!isHidden} onCheckedChange={(v) => toggle(it.id, Boolean(v))} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Size</span>
                                  <Select value={scope.sizes[it.id] || 'auto'} onValueChange={(v) => setSize(it.id, v as any)}>
                                    <SelectTrigger className="h-7 w-32 text-xs">
                                      <SelectValue placeholder="Auto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="auto">Auto</SelectItem>
                                      <SelectItem value="1">1 col</SelectItem>
                                      <SelectItem value="2">2 cols</SelectItem>
                                      {scope.id === 'about-top' ? (<SelectItem value="3">3 cols</SelectItem>) : null}
                                      <SelectItem value="full">Full row</SelectItem>
                                      <SelectItem value="full">Full row</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-end gap-2 px-3 py-2">
                        <Button variant="outline" size="sm" className="h-7 px-2" onClick={reset}>Reset scope</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2" onClick={resetSizes}>Reset sizes</Button>
                      </div>
                    </div>
                  )
                })
              )}
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => {
                    getScopes().forEach((scope) => { const id = scope.getAttribute('data-cards-scope') || 'default'; saveHidden(id, []); applyVisibility(scope, []) })
                    setUiVersion((v) => v + 1)
                  }}>Reset all visibility</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => {
                    getScopes().forEach((scope) => { const id = scope.getAttribute('data-cards-scope') || 'default'; saveSizes(id, {}); applySizes(scope, {}) })
                    setUiVersion((v) => v + 1)
                  }}>Reset all sizes</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
