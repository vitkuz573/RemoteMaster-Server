'use client';

import { useEffect } from 'react';
import { useHostSelectionStore } from '@/lib/stores';

export function useDragSelection() {
  const {
    dragState,
    containerRect,
    updateSelection,
    setDragState,
    setJustDragged,
  } = useHostSelectionStore();

  useEffect(() => {
    // Capture mousedown globally to ensure we start drag even when child stops propagation
    const handleMouseDownCapture = (e: MouseEvent) => {
      if (e.button !== 0) return; // left button only
      if (!containerRect) return;

      // Ignore from context menu overlay
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-host-context-menu]')) return;

      const { left, top, right, bottom } = containerRect;
      const { clientX, clientY } = e;
      // Start drag only if the press was inside the container rect
      if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
        const x = clientX - left;
        const y = clientY - top;
        setJustDragged(false);
        setDragState({
          isDragging: true,
          dragStart: { x, y },
          dragEnd: { x, y },
          didDrag: false,
        });
      }
    };

    document.addEventListener('mousedown', handleMouseDownCapture, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDownCapture, true);
    };
  }, [containerRect, setDragState, setJustDragged]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.dragStart || !containerRect) return;
      
      const currentX = e.clientX - containerRect.left;
      const currentY = e.clientY - containerRect.top;

      const dx = Math.abs(currentX - dragState.dragStart.x);
      const dy = Math.abs(currentY - dragState.dragStart.y);
      const moved = dx > 3 || dy > 3;

      setDragState({
        ...dragState,
        dragEnd: { x: currentX, y: currentY },
        didDrag: dragState.didDrag || moved,
      });
    };

    const handleMouseUp = () => {
      if (dragState.isDragging && dragState.dragStart && dragState.dragEnd && dragState.didDrag) {
        updateSelection(dragState.dragStart, dragState.dragEnd);
        setJustDragged(true);
      }

      setDragState({
        isDragging: false,
        dragStart: null,
        dragEnd: null,
        didDrag: false,
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, dragState.dragStart, dragState.dragEnd, dragState.didDrag, containerRect, updateSelection, setDragState, setJustDragged]);
}
