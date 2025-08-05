'use client';

import { useSetupWizardStore } from '@/lib/stores';

export const useSetupWizardState = () => {
  const {
    currentStep,
    isSubmitting,
    isDiscovering,
    orgForm,
    byoidForm,
    totalMonthly,
    registrationResult,
    setCurrentStep,
    setIsSubmitting,
    setIsDiscovering,
    setOrgForm,
    setByoidForm,
    setTotalMonthly,
    setRegistrationResult,
    resetWizard,
  } = useSetupWizardStore();

  return {
    // State
    currentStep,
    isSubmitting,
    isDiscovering,
    orgForm,
    byoidForm,
    totalMonthly,
    registrationResult,
    
    // Actions
    setCurrentStep,
    setIsSubmitting,
    setIsDiscovering,
    setOrgForm,
    setByoidForm,
    setTotalMonthly,
    setRegistrationResult,
    resetWizard,
  };
}; 