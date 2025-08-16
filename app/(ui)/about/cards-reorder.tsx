"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GripVertical } from 'lucide-react'

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={enabled ? 'default' : 'outline'} size="sm" className="h-7 px-2" onClick={() => setEnabled((v) => !v)}>
            <GripVertical className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{enabled ? 'Reorder: on' : 'Reorder: off'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

