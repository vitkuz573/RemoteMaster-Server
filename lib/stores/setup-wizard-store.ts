import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WizardStep = 
  | 'organization' 
  | 'contact' 
  | 'pricing' 
  | 'byoid' 
  | 'review' 
  | 'complete';

export interface OrganizationForm {
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
}

export interface BYOIDForm {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  discoveryData?: any;
}

export interface SetupWizardState {
  currentStep: WizardStep;
  isSubmitting: boolean;
  isDiscovering: boolean;
  orgForm: OrganizationForm;
  byoidForm: BYOIDForm;
  totalMonthly: number;
  registrationResult: any;
}

interface SetupWizardActions {
  setCurrentStep: (step: WizardStep) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsDiscovering: (discovering: boolean) => void;
  setOrgForm: (form: Partial<OrganizationForm>) => void;
  setByoidForm: (form: Partial<BYOIDForm>) => void;
  setTotalMonthly: (total: number) => void;
  setRegistrationResult: (result: any) => void;
  resetWizard: () => void;
}

type SetupWizardStore = SetupWizardState & SetupWizardActions;

const initialOrgForm: OrganizationForm = {
  name: '',
  domain: '',
  industry: 'loading',
  size: 'loading',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  description: '',
  expectedUsers: 10,
  selectedPlan: 'free'
};

const initialByoidForm: BYOIDForm = {
  issuerUrl: '',
  clientId: '',
  clientSecret: ''
};

const initialState: SetupWizardState = {
  currentStep: 'organization',
  isSubmitting: false,
  isDiscovering: false,
  orgForm: initialOrgForm,
  byoidForm: initialByoidForm,
  totalMonthly: 0,
  registrationResult: null,
};

export const useSetupWizardStore = create<SetupWizardStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentStep: (step: WizardStep) => set((state) => ({
        ...state,
        currentStep: step,
      })),
      
      setIsSubmitting: (submitting: boolean) => set((state) => ({
        ...state,
        isSubmitting: submitting,
      })),
      
      setIsDiscovering: (discovering: boolean) => set((state) => ({
        ...state,
        isDiscovering: discovering,
      })),
      
      setOrgForm: (form: Partial<OrganizationForm>) => set((state) => ({
        ...state,
        orgForm: { ...state.orgForm, ...form },
      })),
      
      setByoidForm: (form: Partial<BYOIDForm>) => set((state) => ({
        ...state,
        byoidForm: { ...state.byoidForm, ...form },
      })),
      
      setTotalMonthly: (total: number) => set((state) => ({
        ...state,
        totalMonthly: total,
      })),
      
      setRegistrationResult: (result: any) => set((state) => ({
        ...state,
        registrationResult: result,
      })),
      
      resetWizard: () => set(initialState),
    }),
    {
      name: 'setup-wizard-store',
      partialize: (state) => ({
        currentStep: state.currentStep,
        isSubmitting: state.isSubmitting,
        isDiscovering: state.isDiscovering,
        orgForm: state.orgForm,
        byoidForm: state.byoidForm,
        totalMonthly: state.totalMonthly,
        registrationResult: state.registrationResult,
      }),
    }
  )
); 