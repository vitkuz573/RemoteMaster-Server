import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  sidebarPosition: 'left' | 'right';
  sidebarOpen: boolean;
  notificationsEnabled: boolean;
  notificationCount: number;
  logoutModalOpen: boolean;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
}

interface AppActions {
  setSidebarPosition: (position: 'left' | 'right') => void;
  toggleSidebar: () => void;
  toggleSidebarOpen: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationCount: (count: number) => void;
  setLogoutModalOpen: (open: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsCheckingAuth: (checking: boolean) => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  sidebarPosition: 'left',
  sidebarOpen: false,
  notificationsEnabled: true,
  notificationCount: 3,
  logoutModalOpen: false,
  isAuthenticated: false,
  isCheckingAuth: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSidebarPosition: (position: 'left' | 'right') => set((state) => ({
        ...state,
        sidebarPosition: position,
      })),
      
      toggleSidebar: () => set((state) => ({
        ...state,
        sidebarPosition: state.sidebarPosition === 'left' ? 'right' : 'left',
      })),
      
      toggleSidebarOpen: () => set((state) => ({
        ...state,
        sidebarOpen: !state.sidebarOpen,
      })),
      
      setNotificationsEnabled: (enabled: boolean) => set((state) => ({
        ...state,
        notificationsEnabled: enabled,
      })),
      
      setNotificationCount: (count: number) => set((state) => ({
        ...state,
        notificationCount: count,
      })),
      
      setLogoutModalOpen: (open: boolean) => set((state) => ({
        ...state,
        logoutModalOpen: open,
      })),
      
      setIsAuthenticated: (authenticated: boolean) => set((state) => ({
        ...state,
        isAuthenticated: authenticated,
      })),
      
      setIsCheckingAuth: (checking: boolean) => set((state) => ({
        ...state,
        isCheckingAuth: checking,
      })),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        sidebarPosition: state.sidebarPosition,
        notificationsEnabled: state.notificationsEnabled,
        notificationCount: state.notificationCount,
      }),
    }
  )
); 