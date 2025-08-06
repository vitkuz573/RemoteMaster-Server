import { create } from 'zustand';

interface AdminState {
  refreshing: boolean;
  isNavigatingToHome: boolean;
  isAuthenticated: boolean;
  showLogin: boolean;
  adminPassword: string;
  loginError: string;
  isApiAvailable: boolean;
  isCheckingApi: boolean;
}

interface AdminActions {
  setRefreshing: (refreshing: boolean) => void;
  setIsNavigatingToHome: (navigating: boolean) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setShowLogin: (show: boolean) => void;
  setAdminPassword: (password: string) => void;
  setLoginError: (error: string) => void;
  setIsApiAvailable: (available: boolean) => void;
  setIsCheckingApi: (checking: boolean) => void;
  resetForm: () => void;
  clearError: () => void;
}

type AdminStore = AdminState & AdminActions;

const initialState: AdminState = {
  refreshing: false,
  isNavigatingToHome: false,
  isAuthenticated: false,
  showLogin: false,
  adminPassword: '',
  loginError: '',
  isApiAvailable: true,
  isCheckingApi: true,
};

export const useAdminStore = create<AdminStore>()((set, get) => ({
  ...initialState,
  
  setRefreshing: (refreshing: boolean) => set((state) => ({
    ...state,
    refreshing,
  })),
  
  setIsNavigatingToHome: (navigating: boolean) => set((state) => ({
    ...state,
    isNavigatingToHome: navigating,
  })),
  
  setIsAuthenticated: (authenticated: boolean) => set((state) => ({
    ...state,
    isAuthenticated: authenticated,
  })),
  
  setShowLogin: (show: boolean) => set((state) => ({
    ...state,
    showLogin: show,
  })),
  
  setAdminPassword: (password: string) => set((state) => ({
    ...state,
    adminPassword: password,
  })),
  
  setLoginError: (error: string) => set((state) => ({
    ...state,
    loginError: error,
  })),
  
  setIsApiAvailable: (available: boolean) => set((state) => ({
    ...state,
    isApiAvailable: available,
  })),
  
  setIsCheckingApi: (checking: boolean) => set((state) => ({
    ...state,
    isCheckingApi: checking,
  })),
  
  resetForm: () => set((state) => ({
    ...state,
    adminPassword: '',
    loginError: '',
  })),
  
  clearError: () => set((state) => ({
    ...state,
    loginError: '',
  })),
})); 