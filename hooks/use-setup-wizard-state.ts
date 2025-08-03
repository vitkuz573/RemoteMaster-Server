import { useState, useEffect, useCallback } from 'react';
import { OrganizationForm, BYOIDForm, WizardStep } from '@/components/setup-wizard/types';

// Storage keys for persistence
const STORAGE_KEYS = {
  CURRENT_STEP: 'setup-wizard-current-step',
  ORG_FORM: 'setup-wizard-org-form',
  BYOID_FORM: 'setup-wizard-byoid-form',
  TOTAL_MONTHLY: 'setup-wizard-total-monthly',
  IS_SUBMITTING: 'setup-wizard-is-submitting',
  IS_DISCOVERING: 'setup-wizard-is-discovering'
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
  const [currentStep, setCurrentStep] = useState<WizardStep>(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_STEP, 'organization')
  );
  
  const [isSubmitting, setIsSubmitting] = useState(() => 
    loadFromStorage(STORAGE_KEYS.IS_SUBMITTING, false)
  );
  
  const [isDiscovering, setIsDiscovering] = useState(() => 
    loadFromStorage(STORAGE_KEYS.IS_DISCOVERING, false)
  );

  const [orgForm, setOrgForm] = useState<OrganizationForm>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.ORG_FORM, null);
    return saved || {
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
  });

  const [byoidForm, setByoidForm] = useState<BYOIDForm>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.BYOID_FORM, null);
    return saved || {
      issuerUrl: '',
      clientId: '',
      clientSecret: ''
    };
  });

  const [totalMonthly, setTotalMonthly] = useState<number>(() => 
    loadFromStorage(STORAGE_KEYS.TOTAL_MONTHLY, 0)
  );

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

  // Utility function to clear all setup wizard state
  const clearSetupWizardState = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }, []);

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
    
    // Utilities
    clearSetupWizardState,
    resetSetupWizardState
  };
}; 