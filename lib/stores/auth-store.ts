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
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // epoch ms when access token expires
}

interface AuthActions {
  login: (tokens: { accessToken: string; refreshToken?: string | null; expiresIn?: number | null }, userData: User) => void;
  logout: () => void;
  setCheckingAuth: (checking: boolean) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null, expiresIn?: number | null) => void;
  setRefreshToken: (token: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: (tokens: { accessToken: string; refreshToken?: string | null; expiresIn?: number | null }, userData: User) => set({
        isAuthenticated: true,
        isCheckingAuth: false,
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
        expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : null,
      }),
      
      logout: () => set({
        isAuthenticated: false,
        isCheckingAuth: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
      
      setCheckingAuth: (checking: boolean) => set((state) => ({
        ...state,
        isCheckingAuth: checking,
      })),
      
      setUser: (user: User | null) => set((state) => ({
        ...state,
        user,
      })),
      
      setAccessToken: (token: string | null, expiresIn?: number | null) => set((state) => ({
        ...state,
        accessToken: token,
        expiresAt: typeof expiresIn === 'number' ? Date.now() + expiresIn * 1000 : state.expiresAt,
      })),

      setRefreshToken: (token: string | null) => set((state) => ({
        ...state,
        refreshToken: token,
      })),
    }),
    {
      name: 'auth-store',
      // Persist minimal auth to survive reloads in dev: refresh token and expiry
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 
