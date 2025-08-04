'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

export interface DragState {
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragEnd: { x: number; y: number } | null;
}

export interface HostSelectionState {
  selectedOrganizationalUnit: string | null;
  selectedHosts: Set<string>;
  dragState: DragState;
  containerRect: DOMRect | null;
}

export interface HostSelectionActions {
  setSelectedOrganizationalUnit: (unitId: string | null) => void;
  handleHostToggle: (hostId: string) => void;
  selectAllHosts: () => void;
  clearSelection: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  updateSelection: (start: { x: number; y: number }, end: { x: number; y: number }) => void;
}

const initialState: HostSelectionState = {
  selectedOrganizationalUnit: null,
  selectedHosts: new Set(),
  dragState: {
    isDragging: false,
    dragStart: null,
    dragEnd: null,
  },
  containerRect: null,
};

export function useHostSelection(): [HostSelectionState, HostSelectionActions] {
  const [state, setState] = useState<HostSelectionState>(initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create actions using useCallback directly (not inside useMemo)
  const setSelectedOrganizationalUnit = useCallback((unitId: string | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedOrganizationalUnit: unitId,
      selectedHosts: new Set() // Clear selection when changing unit
    }));
  }, []);

  const handleHostToggle = useCallback((hostId: string) => {
    setState(prev => {
      const newSelectedHosts = new Set(prev.selectedHosts);
      if (newSelectedHosts.has(hostId)) {
        newSelectedHosts.delete(hostId);
      } else {
        newSelectedHosts.add(hostId);
      }
      return { ...prev, selectedHosts: newSelectedHosts };
    });
  }, []);

  const selectAllHosts = useCallback(() => {
    const hostElements = document.querySelectorAll('[data-host-id]');
    const allHostIds = Array.from(hostElements)
      .map(el => el.getAttribute('data-host-id'))
      .filter(Boolean) as string[];
    setState(prev => ({ ...prev, selectedHosts: new Set(allHostIds) }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedHosts: new Set() }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setState(prev => ({
      ...prev,
      dragState: {
        isDragging: true,
        dragStart: { x, y },
        dragEnd: { x, y },
      },
      containerRect: rect,
    }));
  }, []);

  const updateSelection = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!state.containerRect) return;

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    // Find hosts within the selection rectangle
    const hostElements = document.querySelectorAll('[data-host-id]');
    const newSelection = new Set<string>();

    hostElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementX = rect.left - state.containerRect!.left;
      const elementY = rect.top - state.containerRect!.top;

      if (
        elementX >= minX &&
        elementX + rect.width <= maxX &&
        elementY >= minY &&
        elementY + rect.height <= maxY
      ) {
        const hostId = element.getAttribute('data-host-id');
        if (hostId) {
          newSelection.add(hostId);
        }
      }
    });

    setState(prev => ({ ...prev, selectedHosts: newSelection }));
  }, [state.containerRect]);

  // Memoize the actions object to prevent unnecessary re-renders
  const actions = useMemo((): HostSelectionActions => ({
    setSelectedOrganizationalUnit,
    handleHostToggle,
    selectAllHosts,
    clearSelection,
    handleMouseDown,
    updateSelection,
  }), [
    setSelectedOrganizationalUnit,
    handleHostToggle,
    selectAllHosts,
    clearSelection,
    handleMouseDown,
    updateSelection,
  ]);

  // Handle mouse move and mouse up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!state.dragState.isDragging || !state.dragState.dragStart || !state.containerRect) return;
      
      const currentX = e.clientX - state.containerRect.left;
      const currentY = e.clientY - state.containerRect.top;
      
      setState(prev => ({
        ...prev,
        dragState: {
          ...prev.dragState,
          dragEnd: { x: currentX, y: currentY },
        },
      }));
    };

    const handleMouseUp = () => {
      if (state.dragState.isDragging && state.dragState.dragStart && state.dragState.dragEnd) {
        updateSelection(state.dragState.dragStart, state.dragState.dragEnd);
      }
      
      setState(prev => ({
        ...prev,
        dragState: {
          isDragging: false,
          dragStart: null,
          dragEnd: null,
        },
      }));
    };

    if (state.dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [state.dragState.isDragging, state.dragState.dragStart, state.dragState.dragEnd, state.containerRect, updateSelection]);

  return [state, actions];
} 