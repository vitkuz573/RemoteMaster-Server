'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  dragStart: Point | null;
  dragEnd: Point | null;
}

interface UseDragSelectionProps {
  containerRef: RefObject<HTMLElement>;
  onSelectionChange: (start: Point, end: Point) => void;
}

export function useDragSelection({
  containerRef,
  onSelectionChange,
}: UseDragSelectionProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: null,
    dragEnd: null,
  });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    setDragState({
      isDragging: true,
      dragStart: { x, y },
      dragEnd: { x, y },
    });
  }, [containerRef]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.dragStart || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - containerRect.left;
      const currentY = e.clientY - containerRect.top;

      setDragState((prev) => ({
        ...prev,
        dragEnd: { x: currentX, y: currentY },
      }));
    };

    const handleMouseUp = () => {
      if (dragState.isDragging && dragState.dragStart && dragState.dragEnd) {
        onSelectionChange(dragState.dragStart, dragState.dragEnd);
      }

      setDragState({
        isDragging: false,
        dragStart: null,
        dragEnd: null,
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
  }, [dragState, containerRef, onSelectionChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown as EventListener);
      return () => {
        container.removeEventListener('mousedown', handleMouseDown as EventListener);
      };
    }
  }, [containerRef, handleMouseDown]);

  return {
    isDragging: dragState.isDragging,
    dragStart: dragState.dragStart,
    dragEnd: dragState.dragEnd,
  };
}
