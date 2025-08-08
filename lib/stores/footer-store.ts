import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FooterConfig {
  showBuildDate: boolean;
}

interface FooterState {
  isFooterVisible: boolean;
  footerConfig: FooterConfig;
}

interface FooterActions {
  hideFooter: () => void;
  showFooter: () => void;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;
}

type FooterStore = FooterState & FooterActions;

const initialState: FooterState = {
  isFooterVisible: true,
  footerConfig: {
    showBuildDate: true,
  },
};

export const useFooterStore = create<FooterStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      hideFooter: () => set((state) => ({
        ...state,
        isFooterVisible: false,
      })),
      
      showFooter: () => set((state) => ({
        ...state,
        isFooterVisible: true,
      })),
      
      updateFooterConfig: (config: Partial<FooterConfig>) => set((state) => ({
        ...state,
        footerConfig: { ...state.footerConfig, ...config },
      })),
    }),
    {
      name: 'footer-store',
      partialize: (state) => ({
        footerConfig: state.footerConfig,
      }),
    }
  )
); 