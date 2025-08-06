import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationForm {
  name: string;
  domain: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  expectedUsers: number;
  selectedPlan: string;
  registrationTimestamp?: string;
  registrationId?: string;
  paymentCompleted?: boolean;
  paymentTimestamp?: string;
  paymentId?: string;
}

interface RegistrationState {
  registrationData: OrganizationForm | null;
  isLoading: boolean;
  isValidAccess: boolean;
}

interface RegistrationActions {
  setRegistrationData: (data: OrganizationForm | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsValidAccess: (valid: boolean) => void;
  loadRegistrationData: () => void;
  clearRegistrationData: () => void;
}

type RegistrationStore = RegistrationState & RegistrationActions;

const initialState: RegistrationState = {
  registrationData: null,
  isLoading: true,
  isValidAccess: false,
};

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setRegistrationData: (data: OrganizationForm | null) => set((state) => ({
        ...state,
        registrationData: data,
      })),
      
      setIsLoading: (loading: boolean) => set((state) => ({
        ...state,
        isLoading: loading,
      })),
      
      setIsValidAccess: (valid: boolean) => set((state) => ({
        ...state,
        isValidAccess: valid,
      })),
      
      loadRegistrationData: () => {
        if (typeof window !== "undefined") {
          const storedData = localStorage.getItem("organizationRegistration");
          if (storedData) {
            try {
              const data = JSON.parse(storedData);
              set((state) => ({
                ...state,
                registrationData: data,
                isValidAccess: true,
                isLoading: false,
              }));
            } catch (error) {
              console.error('Error parsing registration data:', error);
              set((state) => ({
                ...state,
                isValidAccess: false,
                isLoading: false,
              }));
            }
          } else {
            set((state) => ({
              ...state,
              isValidAccess: false,
              isLoading: false,
            }));
          }
        }
      },
      
      clearRegistrationData: () => set((state) => ({
        ...state,
        registrationData: null,
        isValidAccess: false,
        isLoading: false,
      })),
    }),
    {
      name: 'registration-store',
      partialize: (state) => ({
        registrationData: state.registrationData,
        isValidAccess: state.isValidAccess,
      }),
    }
  )
); 