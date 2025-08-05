import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApiState {
  isConnected: boolean;
  isConnecting: boolean;
  lastSync: Date | null;
  errors: string[];
  pendingRequests: number;
  apiUrl: string;
  isMockApi: boolean;
  isApiAvailable: boolean;
  isCheckingApi: boolean;
}

interface ApiActions {
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setLastSync: (date: Date) => void;
  setApiUrl: (url: string) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
  incrementPending: () => void;
  decrementPending: () => void;
  setMockApi: (isMock: boolean) => void;
  setApiAvailable: (available: boolean) => void;
  setCheckingApi: (checking: boolean) => void;
}

type ApiStore = ApiState & ApiActions;

const initialState: ApiState = {
  isConnected: false,
  isConnecting: false,
  lastSync: null,
  errors: [],
  pendingRequests: 0,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  isMockApi: false,
  isApiAvailable: false,
  isCheckingApi: false,
};

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setConnected: (connected: boolean) => set((state) => ({ 
        ...state, 
        isConnected: connected,
        isConnecting: false // Stop connecting when connection is established
      })),
      
      setConnecting: (connecting: boolean) => set((state) => ({ 
        ...state, 
        isConnecting: connecting 
      })),
      
      setLastSync: (date: Date) => set((state) => ({ 
        ...state, 
        lastSync: date 
      })),
      
      setApiUrl: (url: string) => set((state) => ({ 
        ...state, 
        apiUrl: url,
        isConnected: false, // Reset connection when URL changes
        isConnecting: false
      })),
      
      addError: (error: string) => set((state) => ({ 
        ...state, 
        errors: [...state.errors.slice(-4), error], // Keep last 5 errors
        isConnecting: false // Stop connecting on error
      })),
      
      clearErrors: () => set((state) => ({ 
        ...state, 
        errors: [] 
      })),
      
      incrementPending: () => set((state) => ({ 
        ...state, 
        pendingRequests: state.pendingRequests + 1 
      })),
      
      decrementPending: () => set((state) => ({ 
        ...state, 
        pendingRequests: Math.max(0, state.pendingRequests - 1) 
      })),
      
      setMockApi: (isMock: boolean) => set((state) => ({ 
        ...state, 
        isMockApi: isMock 
      })),
      
      setApiAvailable: (available: boolean) => set((state) => ({ 
        ...state, 
        isApiAvailable: available 
      })),
      
      setCheckingApi: (checking: boolean) => set((state) => ({ 
        ...state, 
        isCheckingApi: checking 
      })),
    }),
    {
      name: 'api-store',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        isMockApi: state.isMockApi,
      }),
    }
  )
); 