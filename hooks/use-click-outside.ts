"use client";

import { useEffect, RefObject, useRef } from 'react';

export interface ClickOutsideOptions<T extends HTMLElement = HTMLElement> {
  events?: Array<'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'touchend'>;
  disabled?: boolean;
  capture?: boolean;
  ignore?: Array<RefObject<T> | HTMLElement | null>;
  onIgnore?: (event: MouseEvent | TouchEvent) => void;
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T> | RefObject<T>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  options: ClickOutsideOptions<T> = {}
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (options.disabled) return;

    const targets = Array.isArray(refs) ? refs : [refs];
    const ignored = options.ignore?.map((i) => (('current' in (i as any)) ? (i as RefObject<T>).current : i as HTMLElement | null)) ?? [];
    const events = options.events ?? ['mousedown', 'touchstart'];
    const capture = options.capture ?? false;

    const listener = (event: Event) => {
      const ev = event as MouseEvent | TouchEvent;
      const path = (ev as any).composedPath?.() as EventTarget[] | undefined;
      const eventTarget = (ev.target as Node) ?? null;

      const isInside = targets.some(ref => {
        const node = ref.current;
        if (!node) return false;
        if (path && path.includes(node)) return true;
        return node.contains(eventTarget);
      });
      if (isInside) return;

      const isIgnored = ignored.some(node => node && (path ? path.includes(node) : node.contains(eventTarget)));
      if (isIgnored) {
        options.onIgnore?.(ev);
        return;
      }

      handlerRef.current(ev);
    };

    events.forEach((e) => document.addEventListener(e, listener, { passive: true, capture }));
    return () => {
      events.forEach((e) => document.removeEventListener(e, listener as EventListener, capture));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs, options.disabled, options.capture, JSON.stringify(options.events), JSON.stringify(options.ignore)]);
}
