'use client';

import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users,
  CreditCard,
  CheckCircle,
  Shield
} from "lucide-react";
import { useHeader } from '@/contexts/header-context';
import { useApiAvailability } from '@/hooks/use-api-availability';
import { useSetupWizardState } from '@/hooks/use-setup-wizard-state';
import { toast } from 'sonner';
import { 
  WizardStepConfig,
  SetupWizardProps 
} from './types';
import { organizationSchema, contactSchema, byoidSchema } from './validation-schemas';
import { OrganizationStep } from './organization-step';
import { ContactStep } from './contact-step';
import { PricingStep } from './pricing-step';
import { BYOIDStep } from './byoid-step';
import { ReviewStep } from './review-step';
import { CompleteStep } from './complete-step';
import { ProgressIndicator } from './progress-indicator';
import { NavigationButtons } from './navigation-buttons';
import { LoadingErrorStates } from './loading-error-states';
import { ConfirmationDialog } from './confirmation-dialog';
import { 
  ApiProvider, 
  SetupWizardDataProvider, 
  SetupWizardDataLoading 
} from './data-providers';

export function SetupWizard({ onStepChange, onComplete }: SetupWizardProps) {
  const { showHeader } = useHeader();
  const { 
    isApiAvailable, 
    isCheckingApi, 
    isFormDisabled, 
    getLoadingText, 
    getStatusMessage,
    api 
  } = useApiAvailability();
  
  // Use custom hook for state management with persistence
  const {
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
    clearSetupWizardState,
    resetSetupWizardState,
    registrationResult,
    setRegistrationResult
  } = useSetupWizardState();
  
  // Confirmation dialog state
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);

  // Client-side hydration state
  const [isClient, setIsClient] = React.useState(false);

  // Show header on setup wizard
  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

  // Set client-side flag
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const steps: WizardStepConfig[] = [
    {
      key: 'organization',
      title: 'Organization Details',
      description: 'Basic information about your organization',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      key: 'contact',
      title: 'Contact Information',
      description: 'Primary contact details',
      icon: <Users className="w-4 h-4" />
    },
    {
      key: 'pricing',
      title: 'Pricing Plan',
      description: 'Choose your subscription plan',
      icon: <CreditCard className="w-4 h-4" />
    },
    ...(orgForm.selectedPlan !== 'free' ? [{
      key: 'byoid' as any,
      title: 'Identity Provider',
      description: 'Configure OpenID Connect (Optional)',
      icon: <Shield className="w-4 h-4" />
    }] : []),
    {
      key: 'review',
      title: 'Review & Complete',
      description: 'Review your setup details and complete the process',
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      key: 'complete',
      title: 'All Done!',
      description: 'Your organization setup is complete',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  // Ensure currentStep is valid
  React.useEffect(() => {
    const stepExists = steps.some(step => step.key === currentStep);
    if (!stepExists) {
      setCurrentStep('organization');
    }
  }, [currentStep]);

  // Calculate currentStepIndex only on client side to prevent hydration mismatch
  const currentStepIndex = isClient ? steps.findIndex(step => step.key === currentStep) : 0;

  const handleOrgInputChange = (field: keyof typeof orgForm, value: string | number) => {
    setOrgForm(prev => ({ ...prev, [field]: value }));
  };

  const handleByoidInputChange = (field: keyof typeof byoidForm, value: string) => {
    setByoidForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscoverProvider = async () => {
    if (!byoidForm.issuerUrl.trim()) {
      toast.error('Please enter an issuer URL first');
      return;
    }

    setIsDiscovering(true);
    try {
      const result = await api.discoverOpenIDProvider(byoidForm.issuerUrl.trim());
      setByoidForm(prev => ({ 
        ...prev, 
        discoveryData: result.discovery 
      }));
      toast.success('OpenID Connect provider discovered successfully!');
    } catch (error) {
      console.error('Discovery failed:', error);
      toast.error('Failed to discover OpenID Connect provider. Please check the issuer URL.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    try {
      switch (currentStep) {
        case 'organization':
          const orgData = {
            name: orgForm.name,
            domain: orgForm.domain,
            industry: orgForm.industry,
            size: orgForm.size,
            description: orgForm.description || ''
          };
          organizationSchema.parse(orgData);
          return true;
        case 'contact':
          const contactData = {
            contactName: orgForm.contactName,
            contactEmail: orgForm.contactEmail,
            contactPhone: orgForm.contactPhone,
            address: orgForm.address,
            expectedUsers: orgForm.expectedUsers
          };
          contactSchema.parse(contactData);
          return true;
        case 'pricing':
          return orgForm.selectedPlan !== '';
        case 'byoid':
          if (byoidForm.issuerUrl.trim() === '') return false;
          if (byoidForm.discoveryData === undefined) return false;
          return true;
        case 'review':
          return true; // Review step is always valid
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleNext = () => {
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      return;
    }

    if (currentStep === 'review') {
      // Submit on review step
      handleSubmit();
    } else {
      // Go to next step based on configured steps array
      const currentIndex = steps.findIndex(step => step.key === currentStep);
      const nextStep = steps[currentIndex + 1];
      
      if (nextStep) {
        setCurrentStep(nextStep.key as any);
        onStepChange?.(nextStep.key as any);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const prevStep = steps[currentIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.key as any);
      onStepChange?.(prevStep.key as any);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit organization registration
      const result = await api.registerOrganization(orgForm);

      // Store registration result for CompleteStep
      setRegistrationResult(result);

      // Save organization data to separate localStorage key (for backup)
      if (isClient && typeof window !== "undefined") {
        const registrationData = {
          ...orgForm,
          ...result.organization,
          credentials: (result as any).credentials,
          registrationTimestamp: new Date().toISOString(),
        };

        // Add BYOID configuration if available
        if (byoidForm.discoveryData && byoidForm.clientId && byoidForm.clientSecret) {
          (registrationData as any).byoidConfig = {
            issuerUrl: byoidForm.issuerUrl,
            clientId: byoidForm.clientId,
            clientSecret: byoidForm.clientSecret,
            discoveryData: byoidForm.discoveryData
          };
        }

        localStorage.setItem("organizationRegistration", JSON.stringify(registrationData));
      }

      toast.success('Organization setup completed successfully!');
      setCurrentStep('complete');
      onComplete?.();
      
    } catch (error) {
      toast.error('Failed to complete organization setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate monthly cost when plan or users change
  React.useEffect(() => {
    const calculateCost = async () => {
      try {
        // Free plan should always be $0
        if (orgForm.selectedPlan === 'free') {
          setTotalMonthly(0);
          return;
        }
        
        const costResponse = await api.calculateMonthlyCost(orgForm.selectedPlan, orgForm.expectedUsers);
        setTotalMonthly(costResponse.calculation.totalCost);
      } catch (error) {
        setTotalMonthly(0);
      }
    };

    if (orgForm.selectedPlan && orgForm.expectedUsers > 0) {
      calculateCost();
    }
  }, [orgForm.selectedPlan, orgForm.expectedUsers, api, setTotalMonthly]);

  const handleStartNew = () => {
    // Reset all state to start fresh
    resetSetupWizardState();
    setCurrentStep('organization');
    
    // Show success message
    toast.success('Starting new organization setup...');
  };

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = () => {
    resetSetupWizardState();
    setShowResetConfirmation(false);
    toast.success('Setup wizard has been reset. You can start over.');
  };

  // Only show loading/error states if we're checking API and it's not available
  // This prevents the "Service Unavailable" error from showing before Suspense loads
  if (isCheckingApi && !isApiAvailable) {
    return (
      <LoadingErrorStates
        isCheckingApi={isCheckingApi}
        isApiAvailable={isApiAvailable}
        getLoadingText={getLoadingText}
        getStatusMessage={getStatusMessage}
      />
    );
  }

  return (
    <ApiProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          {/* Progress Indicator */}
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            isLoading={!isClient}
          />

          {/* Enhanced Current Step Content */}
          <Card className="mb-6 border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {steps[currentStepIndex].icon}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {steps[currentStepIndex].title}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {steps[currentStepIndex].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<SetupWizardDataLoading />}>
                    <SetupWizardDataProvider>
                      {({ industries, companySizes, pricingPlans }) => (
                        <>
                          {currentStep === 'organization' && (
                            <OrganizationStep
                              form={orgForm}
                              onFormChange={handleOrgInputChange}
                              industries={industries}
                              companySizes={companySizes}
                              isFormDisabled={isFormDisabled}
                            />
                          )}

                          {currentStep === 'contact' && (
                            <ContactStep
                              form={orgForm}
                              onFormChange={handleOrgInputChange}
                              isFormDisabled={isFormDisabled}
                            />
                          )}

                          {currentStep === 'pricing' && (
                            <PricingStep
                              form={orgForm}
                              onFormChange={handleOrgInputChange}
                              pricingPlans={pricingPlans}
                              isFormDisabled={isFormDisabled}
                              totalMonthly={totalMonthly}
                            />
                          )}

                          {currentStep === 'byoid' && (
                            <BYOIDStep
                              form={byoidForm}
                              onFormChange={handleByoidInputChange}
                              onDiscoverProvider={handleDiscoverProvider}
                              isFormDisabled={isFormDisabled}
                              isDiscovering={isDiscovering}
                            />
                          )}

                          {currentStep === 'review' && (
                            <ReviewStep 
                              orgForm={orgForm} 
                              byoidForm={byoidForm} 
                              totalMonthly={totalMonthly}
                              pricingPlans={pricingPlans}
                              industries={industries}
                              companySizes={companySizes}
                            />
                          )}

                          {currentStep === 'complete' && (
                            <CompleteStep 
                              orgForm={orgForm} 
                              registrationResult={registrationResult}
                              onStartNew={handleStartNew} 
                            />
                          )}
                        </>
                      )}
                    </SetupWizardDataProvider>
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          {currentStep !== 'complete' && (
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              onReset={handleReset}
              canGoBack={currentStepIndex > 0}
              canGoNext={validateCurrentStep()}
              isSubmitting={isSubmitting}
              isFormDisabled={isFormDisabled}
              isLastStep={currentStep === 'review'}
            />
          )}
        </div>
        <ConfirmationDialog
          isOpen={showResetConfirmation}
          onClose={() => setShowResetConfirmation(false)}
          onConfirm={handleConfirmReset}
          title="Reset Setup Wizard"
          description="Are you sure you want to reset the setup wizard? This will clear all your current progress and start over from the beginning."
          confirmText="Reset"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </ApiProvider>
  );
} 