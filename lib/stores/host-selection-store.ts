import { create } from 'zustand';

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

interface HostSelectionActions {
  setSelectedOrganizationalUnit: (unitId: string | null) => void;
  handleHostToggle: (hostId: string) => void;
  selectAllHosts: () => void;
  clearSelection: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  updateSelection: (start: { x: number; y: number }, end: { x: number; y: number }) => void;
  setDragState: (dragState: DragState) => void;
  setContainerRect: (rect: DOMRect | null) => void;
}

type HostSelectionStore = HostSelectionState & HostSelectionActions;

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

export const useHostSelectionStore = create<HostSelectionStore>()((set, get) => ({
  ...initialState,
  
  setSelectedOrganizationalUnit: (unitId: string | null) => set((state) => ({
    ...state,
    selectedOrganizationalUnit: unitId,
    selectedHosts: new Set(), // Clear selection when changing unit
  })),
  
  handleHostToggle: (hostId: string) => set((state) => {
    const newSelectedHosts = new Set(state.selectedHosts);
    if (newSelectedHosts.has(hostId)) {
      newSelectedHosts.delete(hostId);
    } else {
      newSelectedHosts.add(hostId);
    }
    return { ...state, selectedHosts: newSelectedHosts };
  }),
  
  selectAllHosts: () => set((state) => {
    const hostElements = document.querySelectorAll('[data-host-id]');
    const allHostIds = Array.from(hostElements)
      .map(el => el.getAttribute('data-host-id'))
      .filter(Boolean) as string[];
    return { ...state, selectedHosts: new Set(allHostIds) };
  }),
  
  clearSelection: () => set((state) => ({
    ...state,
    selectedHosts: new Set(),
  })),
  
  handleMouseDown: (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    set((state) => ({
      ...state,
      dragState: {
        isDragging: true,
        dragStart: { x, y },
        dragEnd: { x, y },
      },
      containerRect: rect,
    }));
  },
  
  updateSelection: (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const state = get();
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

    set((state) => ({ ...state, selectedHosts: newSelection }));
  },
  
  setDragState: (dragState: DragState) => set((state) => ({
    ...state,
    dragState,
  })),
  
  setContainerRect: (rect: DOMRect | null) => set((state) => ({
    ...state,
    containerRect: rect,
  })),
})); 