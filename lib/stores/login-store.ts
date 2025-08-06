import { create } from 'zustand';

interface KnownTenant {
  id: string;
  name: string;
  domain: string;
  logo?: string;
}

interface LoginState {
  loginMode: 'sso' | 'credentials';
  organizationId: string;
  domain: string;
  email: string;
  password: string;
  isLoading: boolean;
  isNavigatingToSetup: boolean;
  error: string;
  isApiAvailable: boolean;
  isCheckingApi: boolean;
  knownTenants: KnownTenant[];
}

interface LoginActions {
  setLoginMode: (mode: 'sso' | 'credentials') => void;
  setOrganizationId: (id: string) => void;
  setDomain: (domain: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsNavigatingToSetup: (navigating: boolean) => void;
  setError: (error: string) => void;
  setIsApiAvailable: (available: boolean) => void;
  setIsCheckingApi: (checking: boolean) => void;
  setKnownTenants: (tenants: KnownTenant[]) => void;
  resetForm: () => void;
  clearError: () => void;
}

type LoginStore = LoginState & LoginActions;

const initialState: LoginState = {
  loginMode: 'sso',
  organizationId: '',
  domain: '',
  email: '',
  password: '',
  isLoading: false,
  isNavigatingToSetup: false,
  error: '',
  isApiAvailable: true,
  isCheckingApi: true,
  knownTenants: [],
};

export const useLoginStore = create<LoginStore>()((set, get) => ({
  ...initialState,
  
  setLoginMode: (mode: 'sso' | 'credentials') => set((state) => ({
    ...state,
    loginMode: mode,
  })),
  
  setOrganizationId: (id: string) => set((state) => ({
    ...state,
    organizationId: id,
  })),
  
  setDomain: (domain: string) => set((state) => ({
    ...state,
    domain,
  })),
  
  setEmail: (email: string) => set((state) => ({
    ...state,
    email,
  })),
  
  setPassword: (password: string) => set((state) => ({
    ...state,
    password,
  })),
  
  setIsLoading: (loading: boolean) => set((state) => ({
    ...state,
    isLoading: loading,
  })),
  
  setIsNavigatingToSetup: (navigating: boolean) => set((state) => ({
    ...state,
    isNavigatingToSetup: navigating,
  })),
  
  setError: (error: string) => set((state) => ({
    ...state,
    error,
  })),
  
  setIsApiAvailable: (available: boolean) => set((state) => ({
    ...state,
    isApiAvailable: available,
  })),
  
  setIsCheckingApi: (checking: boolean) => set((state) => ({
    ...state,
    isCheckingApi: checking,
  })),
  
  setKnownTenants: (tenants: KnownTenant[]) => set((state) => ({
    ...state,
    knownTenants: tenants,
  })),
  
  resetForm: () => set((state) => ({
    ...state,
    organizationId: '',
    domain: '',
    email: '',
    password: '',
    error: '',
    isLoading: false,
    isNavigatingToSetup: false,
  })),
  
  clearError: () => set((state) => ({
    ...state,
    error: '',
  })),
})); 