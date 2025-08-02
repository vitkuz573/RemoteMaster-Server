/**
 * API Context for global state management
 * Provides centralized API state and operations across the application
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// API State Types
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

// API Actions
export type ApiAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'SET_API_URL'; payload: string }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'INCREMENT_PENDING' }
  | { type: 'DECREMENT_PENDING' }
  | { type: 'SET_MOCK_API'; payload: boolean }
  | { type: 'SET_API_AVAILABLE'; payload: boolean }
  | { type: 'SET_CHECKING_API'; payload: boolean };

// Initial state
const initialState: ApiState = {
  isConnected: false,
  isConnecting: false,
  lastSync: null,
  errors: [],
  pendingRequests: 0,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  isMockApi: false,
  isApiAvailable: true,
  isCheckingApi: false,
};

// Reducer
function apiReducer(state: ApiState, action: ApiAction): ApiState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { 
        ...state, 
        isConnected: action.payload,
        isConnecting: false // Stop connecting when connection is established
      };
    
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    
    case 'SET_API_URL':
      return { 
        ...state, 
        apiUrl: action.payload,
        isConnected: false, // Reset connection when URL changes
        isConnecting: false
      };
    
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [...state.errors.slice(-4), action.payload], // Keep last 5 errors
        isConnecting: false // Stop connecting on error
      };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    
    case 'INCREMENT_PENDING':
      return { ...state, pendingRequests: state.pendingRequests + 1 };
    
    case 'DECREMENT_PENDING':
      return { 
        ...state, 
        pendingRequests: Math.max(0, state.pendingRequests - 1) 
      };
    
    case 'SET_MOCK_API':
      return { ...state, isMockApi: action.payload };
    
    case 'SET_API_AVAILABLE':
      return { ...state, isApiAvailable: action.payload };
    
    case 'SET_CHECKING_API':
      return { ...state, isCheckingApi: action.payload };
    
    default:
      return state;
  }
}

// Context
interface ApiContextType {
  state: ApiState;
  dispatch: React.Dispatch<ApiAction>;
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

const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  // Initialize API state based on configuration
  React.useEffect(() => {
    // Import API_CONFIG dynamically to avoid SSR issues
    import('@/lib/api-config').then(({ API_CONFIG }) => {
      setMockApi(API_CONFIG.USE_MOCK_API);
    });
  }, []);

  const setConnected = (connected: boolean) => {
    dispatch({ type: 'SET_CONNECTED', payload: connected });
  };

  const setConnecting = (connecting: boolean) => {
    dispatch({ type: 'SET_CONNECTING', payload: connecting });
  };

  const setLastSync = (date: Date) => {
    dispatch({ type: 'SET_LAST_SYNC', payload: date });
  };

  const setApiUrl = (url: string) => {
    dispatch({ type: 'SET_API_URL', payload: url });
  };

  const addError = (error: string) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const incrementPending = () => {
    dispatch({ type: 'INCREMENT_PENDING' });
  };

  const decrementPending = () => {
    dispatch({ type: 'DECREMENT_PENDING' });
  };

  const setMockApi = (isMock: boolean) => {
    dispatch({ type: 'SET_MOCK_API', payload: isMock });
  };

  const setApiAvailable = (available: boolean) => {
    dispatch({ type: 'SET_API_AVAILABLE', payload: available });
  };

  const setCheckingApi = (checking: boolean) => {
    dispatch({ type: 'SET_CHECKING_API', payload: checking });
  };

  const value: ApiContextType = {
    state,
    dispatch,
    setConnected,
    setConnecting,
    setLastSync,
    setApiUrl,
    addError,
    clearErrors,
    incrementPending,
    decrementPending,
    setMockApi,
    setApiAvailable,
    setCheckingApi,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

// Hook to use the API context
export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
} 