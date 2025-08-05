'use client';

import { useEffect } from 'react';
import { useHostSelectionStore } from '@/lib/stores';

export function useHostSelection() {
  const {
    selectedOrganizationalUnit,
    selectedHosts,
    dragState,
    containerRect,
    setSelectedOrganizationalUnit,
    handleHostToggle,
    selectAllHosts,
    clearSelection,
    handleMouseDown,
    updateSelection,
    setDragState,
    setContainerRect,
  } = useHostSelectionStore();

  // Handle mouse move and mouse up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.dragStart || !containerRect) return;
      
      const currentX = e.clientX - containerRect.left;
      const currentY = e.clientY - containerRect.top;
      
      setDragState({
        ...dragState,
        dragEnd: { x: currentX, y: currentY },
      });
    };

    const handleMouseUp = () => {
      if (dragState.isDragging && dragState.dragStart && dragState.dragEnd) {
        updateSelection(dragState.dragStart, dragState.dragEnd);
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
  }, [dragState.isDragging, dragState.dragStart, dragState.dragEnd, containerRect, updateSelection, setDragState]);

  return {
    selectedOrganizationalUnit,
    selectedHosts,
    dragState,
    containerRect,
    setSelectedOrganizationalUnit,
    handleHostToggle,
    selectAllHosts,
    clearSelection,
    handleMouseDown,
    updateSelection,
  };
} 