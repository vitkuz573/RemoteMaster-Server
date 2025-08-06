import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HeaderConfig {
  showNotifications?: boolean;
  showProfile?: boolean;
  showSidebarToggle?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

interface HeaderState {
  isVisible: boolean;
  config: HeaderConfig;
}

interface HeaderActions {
  showHeader: () => void;
  hideHeader: () => void;
  toggleHeader: () => void;
  updateConfig: (newConfig: Partial<HeaderConfig>) => void;
  resetConfig: () => void;
}

type HeaderStore = HeaderState & HeaderActions;

const defaultConfig: HeaderConfig = {
  showNotifications: false,
  showProfile: false,
  showSidebarToggle: true,
};

const initialState: HeaderState = {
  isVisible: true,
  config: defaultConfig,
};

export const useHeaderStore = create<HeaderStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      showHeader: () => set((state) => ({
        ...state,
        isVisible: true,
      })),
      
      hideHeader: () => set((state) => ({
        ...state,
        isVisible: false,
      })),
      
      toggleHeader: () => set((state) => ({
        ...state,
        isVisible: !state.isVisible,
      })),
      
      updateConfig: (newConfig: Partial<HeaderConfig>) => set((state) => ({
        ...state,
        config: { ...state.config, ...newConfig },
      })),
      
      resetConfig: () => set((state) => ({
        ...state,
        config: defaultConfig,
      })),
    }),
    {
      name: 'header-store',
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
); 