'use client';

import React from 'react';
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
import { 
  OrganizationForm, 
  BYOIDForm, 
  WizardStep, 
  WizardStepConfig,
  SetupWizardProps 
} from './types';
import { organizationSchema, contactSchema, byoidSchema } from './validation-schemas';
import { OrganizationStep } from './organization-step';
import { ContactStep } from './contact-step';
import { PricingStep } from './pricing-step';
import { BYOIDStep } from './byoid-step';
import { CompleteStep } from './complete-step';
import { ProgressIndicator } from './progress-indicator';
import { NavigationButtons } from './navigation-buttons';
import { LoadingErrorStates } from './loading-error-states';

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
  
  // State for API data
  const [industries, setIndustries] = React.useState<string[]>([]);
  const [companySizes, setCompanySizes] = React.useState<string[]>([]);
  const [pricingPlans, setPricingPlans] = React.useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('organization');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDiscovering, setIsDiscovering] = React.useState(false);

  // Organization form data
  const [orgForm, setOrgForm] = React.useState<OrganizationForm>({
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

  // BYOID form data
  const [byoidForm, setByoidForm] = React.useState<BYOIDForm>({
    issuerUrl: '',
    clientId: '',
    clientSecret: ''
  });

  // Load API data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // Load industries
        const industriesResponse = await api.getIndustries();
        if (industriesResponse.success) {
          setIndustries(industriesResponse.industries);
        }
        
        // Load company sizes
        const companySizesResponse = await api.getCompanySizes();
        if (companySizesResponse.success) {
          setCompanySizes(companySizesResponse.companySizes);
        }
        
        // Load pricing plans
        const pricingPlansResponse = await api.getPricingPlans();
        if (pricingPlansResponse.success) {
          setPricingPlans(pricingPlansResponse.plans);
        }
        
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [api]);

  // Reset form values when data loads
  React.useEffect(() => {
    if (!isLoadingData) {
      setOrgForm(prev => ({
        ...prev,
        industry: prev.industry === 'loading' ? '' : prev.industry,
        size: prev.size === 'loading' ? '' : prev.size
      }));
    }
  }, [isLoadingData]);

  // Show header on setup wizard
  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

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
      key: 'byoid' as WizardStep,
      title: 'Identity Provider',
      description: 'Configure OpenID Connect (Optional)',
      icon: <Shield className="w-4 h-4" />
    }] : []),
    {
      key: 'complete',
      title: 'Setup Complete',
      description: 'Your organization is ready',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleOrgInputChange = (field: keyof OrganizationForm, value: string | number) => {
    setOrgForm(prev => ({ ...prev, [field]: value }));
  };

  const handleByoidInputChange = (field: keyof BYOIDForm, value: string) => {
    setByoidForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscoverProvider = async () => {
    if (!byoidForm.issuerUrl.trim()) {
      alert('Please enter an issuer URL first');
      return;
    }

    setIsDiscovering(true);
    try {
      const result = await api.discoverOpenIDProvider(byoidForm.issuerUrl.trim());
      setByoidForm(prev => ({ 
        ...prev, 
        discoveryData: result.discovery 
      }));
    } catch (error) {
      console.error('Discovery failed:', error);
      alert('Failed to discover OpenID Connect provider. Please check the issuer URL.');
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
        default:
          return true;
      }
    } catch (error) {
      console.log('Validation error:', error);
      return false;
    }
  };

  const handleNext = () => {
    console.log('handleNext called for step:', currentStep);
    const isValid = validateCurrentStep();
    console.log('Validation result:', isValid);
    
    if (!isValid) {
      console.log('Validation failed, cannot proceed');
      return;
    }

    if (currentStep === 'byoid' || (currentStep === 'pricing' && orgForm.selectedPlan === 'free')) {
      handleSubmit();
    } else {
      const currentIndex = steps.findIndex(step => step.key === currentStep);
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.key);
        onStepChange?.(nextStep.key);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const prevStep = steps[currentIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.key);
      onStepChange?.(prevStep.key);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit organization registration
      const result = await api.registerOrganization(orgForm);

      // Save organization data
      if (typeof window !== "undefined") {
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

      alert('Organization setup completed successfully!');
      setCurrentStep('complete');
      onComplete?.();
      
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [totalMonthly, setTotalMonthly] = React.useState<number>(0);

  // Calculate monthly cost when plan or users change
  React.useEffect(() => {
    const calculateCost = async () => {
      try {
        const costResponse = await api.calculateMonthlyCost(orgForm.selectedPlan, orgForm.expectedUsers);
        setTotalMonthly(costResponse.calculation.totalCost);
      } catch (error) {
        console.error('Failed to calculate cost:', error);
        setTotalMonthly(0);
      }
    };

    if (orgForm.selectedPlan && orgForm.expectedUsers > 0) {
      calculateCost();
    }
  }, [orgForm.selectedPlan, orgForm.expectedUsers, api]);

  // Check for loading/error states first
  if (isCheckingApi || !isApiAvailable) {
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
                {currentStep === 'organization' && (
                  <OrganizationStep
                    form={orgForm}
                    onFormChange={handleOrgInputChange}
                    industries={industries}
                    companySizes={companySizes}
                    isLoadingData={isLoadingData}
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
                    isLoadingData={isLoadingData}
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

                {currentStep === 'complete' && (
                  <CompleteStep orgForm={orgForm} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 'complete' && (
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            canGoBack={currentStepIndex > 0}
            canGoNext={validateCurrentStep()}
            isSubmitting={isSubmitting}
            isFormDisabled={isFormDisabled}
            isLastStep={currentStep === 'byoid' || (currentStep === 'pricing' && orgForm.selectedPlan === 'free')}
          />
        )}
      </div>
    </div>
  );
} 