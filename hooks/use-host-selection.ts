'use client';

import { useHostSelectionStore } from '@/lib/stores';
import { useDragSelection } from './use-drag-selection';

export function useHostSelection() {
  useDragSelection();
  return useHostSelectionStore();
} 