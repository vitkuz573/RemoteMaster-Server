import { useState, useEffect, useCallback } from 'react';
import { OrganizationForm, BYOIDForm, WizardStep } from '@/components/setup-wizard/types';

// Storage keys for persistence
const STORAGE_KEYS = {
  CURRENT_STEP: 'setup-wizard-current-step',
  ORG_FORM: 'setup-wizard-org-form',
  BYOID_FORM: 'setup-wizard-byoid-form',
  TOTAL_MONTHLY: 'setup-wizard-total-monthly',
  IS_SUBMITTING: 'setup-wizard-is-submitting',
  IS_DISCOVERING: 'setup-wizard-is-discovering',
  REGISTRATION_RESULT: 'setup-wizard-registration-result'
} as const;

// Helper functions for localStorage
const saveToStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const useSetupWizardState = () => {
  // Initialize state from localStorage
  const [currentStep, setCurrentStep] = useState<WizardStep>('organization');
  
  // Load from localStorage after client-side hydration
  useEffect(() => {
    const savedStep = loadFromStorage(STORAGE_KEYS.CURRENT_STEP, 'organization');
    setCurrentStep(savedStep);
  }, []);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // Load from localStorage after client-side hydration
  useEffect(() => {
    const savedSubmitting = loadFromStorage(STORAGE_KEYS.IS_SUBMITTING, false);
    const savedDiscovering = loadFromStorage(STORAGE_KEYS.IS_DISCOVERING, false);
    setIsSubmitting(savedSubmitting);
    setIsDiscovering(savedDiscovering);
  }, []);

  const [orgForm, setOrgForm] = useState<OrganizationForm>({
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
  });
  
  // Load from localStorage after client-side hydration
  useEffect(() => {
    const saved = loadFromStorage(STORAGE_KEYS.ORG_FORM, null);
    if (saved) {
      setOrgForm(saved);
    }
  }, []);

  const [byoidForm, setByoidForm] = useState<BYOIDForm>({
    issuerUrl: '',
    clientId: '',
    clientSecret: ''
  });
  
  // Load from localStorage after client-side hydration
  useEffect(() => {
    const saved = loadFromStorage(STORAGE_KEYS.BYOID_FORM, null);
    if (saved) {
      setByoidForm(saved);
    }
  }, []);

  const [totalMonthly, setTotalMonthly] = useState<number>(0);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  
  // Load from localStorage after client-side hydration
  useEffect(() => {
    const savedTotal = loadFromStorage(STORAGE_KEYS.TOTAL_MONTHLY, 0);
    const savedResult = loadFromStorage(STORAGE_KEYS.REGISTRATION_RESULT, null);
    setTotalMonthly(savedTotal);
    setRegistrationResult(savedResult);
    
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORG_FORM, orgForm);
  }, [orgForm]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BYOID_FORM, byoidForm);
  }, [byoidForm]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TOTAL_MONTHLY, totalMonthly);
  }, [totalMonthly]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.IS_SUBMITTING, isSubmitting);
  }, [isSubmitting]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.IS_DISCOVERING, isDiscovering);
  }, [isDiscovering]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REGISTRATION_RESULT, registrationResult);
    
  }, [registrationResult]);

  // Utility function to clear all setup wizard state
  const clearSetupWizardState = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        // Don't clear registration result if we're on the complete step
        const keysToClear = Object.values(STORAGE_KEYS).filter(key => 
          key !== STORAGE_KEYS.REGISTRATION_RESULT || currentStep !== 'complete'
        );
        
        keysToClear.forEach(key => {
          localStorage.removeItem(key);
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }, [currentStep]);

  // Utility function to reset to initial state
  const resetSetupWizardState = useCallback(() => {
    setCurrentStep('organization');
    setIsSubmitting(false);
    setIsDiscovering(false);
    setOrgForm({
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
    });
    setByoidForm({
      issuerUrl: '',
      clientId: '',
      clientSecret: ''
    });
    setTotalMonthly(0);
    setRegistrationResult(null);
    clearSetupWizardState();
  }, [clearSetupWizardState]);

  return {
    // State
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    isDiscovering,
    setIsDiscovering,
    orgForm,
    setOrgForm,
    byoidForm,
    setByoidForm,
    totalMonthly,
    setTotalMonthly,
    registrationResult,
    setRegistrationResult,
    
    // Utilities
    clearSetupWizardState,
    resetSetupWizardState
  };
}; 