import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  organizationId: string;
  organizationDomain: string;
  organizationName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: User | null;
  token: string | null;
}

interface AuthActions {
  login: (token: string, userData: User) => void;
  logout: () => void;
  setCheckingAuth: (checking: boolean) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
  token: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: (token: string, userData: User) => set({
        isAuthenticated: true,
        isCheckingAuth: false,
        user: userData,
        token,
      }),
      
      logout: () => set({
        isAuthenticated: false,
        isCheckingAuth: false,
        user: null,
        token: null,
      }),
      
      setCheckingAuth: (checking: boolean) => set((state) => ({
        ...state,
        isCheckingAuth: checking,
      })),
      
      setUser: (user: User | null) => set((state) => ({
        ...state,
        user,
      })),
      
      setToken: (token: string | null) => set((state) => ({
        ...state,
        token,
      })),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 