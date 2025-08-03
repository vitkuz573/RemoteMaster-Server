'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  ArrowLeft,
  ArrowRight,
  Settings,
  Key,
  FileText,
  Info
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { useHeader } from '@/contexts/header-context';
import { useApiAvailability } from '@/hooks/use-api-availability';

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
}

interface BYOIDForm {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  discoveryData?: {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
    response_types_supported: string[];
    subject_types_supported: string[];
    id_token_signing_alg_values_supported: string[];
    scopes_supported: string[];
    claims_supported: string[];
    end_session_endpoint?: string;
  };
}

type WizardStep = 'organization' | 'contact' | 'pricing' | 'byoid' | 'complete';

export function SetupWizard() {
  const router = useRouter();
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



  const steps: { key: WizardStep; title: string; description: string; icon: React.ReactNode }[] = [
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
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleOrgInputChange = (field: keyof OrganizationForm, value: string | number) => {
    setOrgForm(prev => ({ ...prev, [field]: value }));
  };

  const handleByoidInputChange = (field: keyof BYOIDForm, value: string) => {
    setByoidForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDiscoverProvider = async () => {
    if (!byoidForm.issuerUrl.trim()) {
      // Show warning using toast or alert
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
    switch (currentStep) {
      case 'organization':
        return orgForm.name.trim() !== '' && 
               orgForm.domain.trim() !== '' && 
               orgForm.industry !== '' && 
               orgForm.industry !== 'loading' && 
               orgForm.size !== '' && 
               orgForm.size !== 'loading';
      case 'contact':
        return orgForm.contactName.trim() !== '' && 
               orgForm.contactEmail.trim() !== '' && 
               orgForm.contactPhone.trim() !== '' && 
               orgForm.address.trim() !== '';
      case 'pricing':
        return orgForm.selectedPlan !== '';
             case 'byoid':
         return byoidForm.issuerUrl.trim() !== '' && byoidForm.discoveryData !== undefined; // Require issuer URL and successful discovery
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 'byoid' || (currentStep === 'pricing' && orgForm.selectedPlan === 'free')) {
      handleSubmit();
    } else {
      const currentIndex = steps.findIndex(step => step.key === currentStep);
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.key);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const prevStep = steps[currentIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.key);
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
          credentials: result.credentials,
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
      
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = pricingPlans.find(plan => plan.id === orgForm.selectedPlan) || pricingPlans[0];
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

  // Show loading state while checking API
  if (isCheckingApi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{getLoadingText()}</p>
        </div>
      </div>
    );
  }

  // Show error state if API unavailable
  if (!isApiAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Service Unavailable</CardTitle>
            <CardDescription>
              {getStatusMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Organization Setup Wizard
              </h1>
              <p className="text-muted-foreground mt-1">Complete your organization configuration</p>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative mb-6">
            <Progress value={progress} className="h-3 bg-muted/50" />
            <div className="absolute inset-0 h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full" />
          </div>
          
          {/* Enhanced Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center gap-2">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index <= currentStepIndex 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  {index === currentStepIndex && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  )}
                </div>
                <div className="text-center">
                  <span className={`text-xs font-medium ${
                    index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                         {currentStep === 'organization' && (
               <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label htmlFor="name" className="text-sm font-medium text-foreground">
                       Organization Name *
                     </Label>
                     <div className="relative">
                       <Input
                         id="name"
                         value={orgForm.name}
                         onChange={(e) => handleOrgInputChange('name', e.target.value)}
                         placeholder="Acme Corporation"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                       {orgForm.name && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Label htmlFor="domain" className="text-sm font-medium text-foreground">
                       Domain *
                     </Label>
                     <div className="relative">
                       <Input
                         id="domain"
                         value={orgForm.domain}
                         onChange={(e) => handleOrgInputChange('domain', e.target.value)}
                         placeholder="acme.com"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                       {orgForm.domain && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         </div>
                       )}
                     </div>
                   </div>
                                     <div className="space-y-3">
                     <Label htmlFor="industry" className="text-sm font-medium text-foreground">
                       Industry *
                     </Label>
                     <Select value={orgForm.industry} onValueChange={(value) => handleOrgInputChange('industry', value)} disabled={isFormDisabled}>
                       <SelectTrigger className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm">
                         <SelectValue placeholder="Select industry" />
                       </SelectTrigger>
                       <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
                         {isLoadingData ? (
                           <SelectItem value="loading" disabled className="text-muted-foreground">
                             <div className="flex items-center gap-2">
                               <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                               Loading industries...
                             </div>
                           </SelectItem>
                         ) : (
                           industries.map((industry) => (
                             <SelectItem key={industry} value={industry} className="hover:bg-primary/10">
                               {industry}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-3">
                     <Label htmlFor="size" className="text-sm font-medium text-foreground">
                       Company Size *
                     </Label>
                     <Select value={orgForm.size} onValueChange={(value) => handleOrgInputChange('size', value)} disabled={isFormDisabled}>
                       <SelectTrigger className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm">
                         <SelectValue placeholder="Select size" />
                       </SelectTrigger>
                       <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
                         {isLoadingData ? (
                           <SelectItem value="loading" disabled className="text-muted-foreground">
                             <div className="flex items-center gap-2">
                               <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                               Loading company sizes...
                             </div>
                           </SelectItem>
                         ) : (
                           companySizes.map((size) => (
                             <SelectItem key={size} value={size} className="hover:bg-primary/10">
                               {size}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                     </Select>
                   </div>
                </div>
                                 <div className="space-y-3">
                   <Label htmlFor="description" className="text-sm font-medium text-foreground">
                     Organization Description
                   </Label>
                   <Textarea
                     id="description"
                     value={orgForm.description}
                     onChange={(e) => handleOrgInputChange('description', e.target.value)}
                     placeholder="Brief description of your organization..."
                     rows={4}
                     disabled={isFormDisabled}
                     className="min-h-[120px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none"
                   />
                 </div>
              </div>
            )}

                         {currentStep === 'contact' && (
               <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label htmlFor="contactName" className="text-sm font-medium text-foreground">
                       Contact Name *
                     </Label>
                     <div className="relative">
                       <Input
                         id="contactName"
                         value={orgForm.contactName}
                         onChange={(e) => handleOrgInputChange('contactName', e.target.value)}
                         placeholder="John Doe"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                       {orgForm.contactName && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
                       Contact Email *
                     </Label>
                     <div className="relative">
                       <Input
                         id="contactEmail"
                         type="email"
                         value={orgForm.contactEmail}
                         onChange={(e) => handleOrgInputChange('contactEmail', e.target.value)}
                         placeholder="john@acme.com"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                       {orgForm.contactEmail && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
                       Contact Phone *
                     </Label>
                     <div className="relative">
                       <Input
                         id="contactPhone"
                         value={orgForm.contactPhone}
                         onChange={(e) => handleOrgInputChange('contactPhone', e.target.value)}
                         placeholder="+1 (555) 123-4567"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                       {orgForm.contactPhone && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Label htmlFor="expectedUsers" className="text-sm font-medium text-foreground">
                       Organization Size (Employees)
                     </Label>
                     <div className="relative">
                       <Input
                         id="expectedUsers"
                         type="number"
                         min="1"
                         max="10000"
                         value={orgForm.expectedUsers}
                         onChange={(e) => handleOrgInputChange('expectedUsers', parseInt(e.target.value) || 10)}
                         placeholder="10"
                         disabled={isFormDisabled}
                         className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
                       />
                     </div>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <Label htmlFor="address" className="text-sm font-medium text-foreground">
                     Address *
                   </Label>
                   <Textarea
                     id="address"
                     value={orgForm.address}
                     onChange={(e) => handleOrgInputChange('address', e.target.value)}
                     placeholder="123 Business St, City, State, ZIP"
                     rows={3}
                     disabled={isFormDisabled}
                     className="min-h-[100px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none"
                   />
                 </div>
               </div>
             )}

            {currentStep === 'pricing' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Select a pricing plan to determine the total monthly cost based on your expected number of users.
                </p>
                
                <div className="space-y-3">
                  {isLoadingData ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 border rounded-lg animate-pulse">
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded mb-3"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    pricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        orgForm.selectedPlan === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={isFormDisabled ? undefined : () => handleOrgInputChange('selectedPlan', plan.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold">{plan.name}</h4>
                          {plan.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">
                              {plan.price === 0 ? 'Free' : `$${plan.price}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {plan.price === 0 ? 'forever' : 'per user/month'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            orgForm.selectedPlan === plan.id
                              ? 'border-primary bg-primary'
                              : 'border-muted hover:border-primary/50'
                          }`}>
                            {orgForm.selectedPlan === plan.id && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                  )}
                </div>

                <Separator />

                                 <div className="text-center">
                   <div className="text-2xl font-bold">
                     {selectedPlan.price === 0 ? 'Free' : `$${totalMonthly}`}
                   </div>
                   <div className="text-xs text-muted-foreground">per month</div>
                 </div>

                 {orgForm.selectedPlan === 'free' && (
                   <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                     <div className="flex items-start gap-3">
                       <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                       <div>
                         <h4 className="font-medium text-blue-900 dark:text-blue-100">Built-in Identity Provider</h4>
                         <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                           Free plan includes our built-in identity provider. No additional configuration required.
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            )}

                         {currentStep === 'byoid' && (
               <div className="space-y-6">
                 <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                   <div className="flex items-start gap-3">
                     <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                     <div>
                       <h4 className="font-medium text-blue-900 dark:text-blue-100">OpenID Connect Setup (Optional)</h4>
                       <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                         Configure your identity provider for enhanced security. Start by entering the issuer URL and clicking "Discover Provider" to automatically configure the endpoints.
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="issuerUrl">Issuer URL *</Label>
                     <div className="flex gap-2">
                       <Input
                         id="issuerUrl"
                         value={byoidForm.issuerUrl}
                         onChange={(e) => handleByoidInputChange('issuerUrl', e.target.value)}
                         placeholder="https://your-idp.com"
                         className="flex-1"
                         disabled={isFormDisabled}
                       />
                       <Button
                         onClick={handleDiscoverProvider}
                         disabled={isDiscovering || !byoidForm.issuerUrl.trim() || isFormDisabled}
                         variant="outline"
                         className="whitespace-nowrap"
                       >
                         {isDiscovering ? (
                           <>
                             <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                             Discovering...
                           </>
                         ) : (
                           <>
                             <Globe className="w-4 h-4 mr-2" />
                             Discover Provider
                           </>
                         )}
                       </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       The OpenID Connect issuer URL. Click "Discover Provider" to automatically configure endpoints.
                     </p>
                   </div>

                   {byoidForm.discoveryData && (
                     <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                       <div className="flex items-start gap-3">
                         <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                         <div className="flex-1">
                           <h4 className="font-medium text-green-900 dark:text-green-100">Provider Discovered Successfully</h4>
                           <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                             <div><strong>Issuer:</strong> {byoidForm.discoveryData.issuer}</div>
                             <div><strong>Authorization Endpoint:</strong> {byoidForm.discoveryData.authorization_endpoint}</div>
                             <div><strong>Token Endpoint:</strong> {byoidForm.discoveryData.token_endpoint}</div>
                             <div><strong>UserInfo Endpoint:</strong> {byoidForm.discoveryData.userinfo_endpoint}</div>
                             <div><strong>Supported Scopes:</strong> {byoidForm.discoveryData.scopes_supported.join(', ')}</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="clientId">Client ID</Label>
                       <Input
                         id="clientId"
                         value={byoidForm.clientId}
                         onChange={(e) => handleByoidInputChange('clientId', e.target.value)}
                         placeholder="your-client-id"
                         disabled={isFormDisabled}
                       />
                       <p className="text-xs text-muted-foreground">
                         The client ID configured in your IdP
                       </p>
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="clientSecret">Client Secret</Label>
                       <Input
                         id="clientSecret"
                         type="password"
                         value={byoidForm.clientSecret}
                         onChange={(e) => handleByoidInputChange('clientSecret', e.target.value)}
                         placeholder="your-client-secret"
                         disabled={isFormDisabled}
                       />
                       <p className="text-xs text-muted-foreground">
                         The client secret configured in your IdP
                       </p>
                     </div>
                   </div>

                   {byoidForm.discoveryData && (
                     <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                       <div className="flex items-start gap-3">
                         <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                         <div>
                           <h4 className="font-medium text-blue-900 dark:text-blue-100">Configuration Complete</h4>
                           <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                             Your OpenID Connect provider has been discovered and configured. You can now proceed with the setup or skip this step to configure it later.
                           </p>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}

                         {currentStep === 'complete' && (
               <div className="text-center space-y-8">
                 {/* Success Icon and Title */}
                 <div className="space-y-4">
                   <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full">
                     <CheckCircle className="w-10 h-10 text-green-600" />
                   </div>
                   <div>
                     <h3 className="text-3xl font-bold mb-3">Setup Complete!</h3>
                     <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                       Your organization <strong>"{orgForm.name}"</strong> has been successfully configured and is ready to use.
                     </p>
                   </div>
                 </div>

                 {/* Login Credentials Card */}
                 <Card className="max-w-2xl mx-auto border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                   <CardHeader className="text-center">
                     <CardTitle className="text-xl flex items-center justify-center gap-2">
                       <Shield className="w-6 h-6 text-green-600" />
                       Your Login Information
                     </CardTitle>
                   </CardHeader>
                                       <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <span className="text-sm font-medium text-muted-foreground">Login URL</span>
                          <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
                            {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/login
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium text-muted-foreground">Admin Email</span>
                          <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
                            {orgForm.contactEmail}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <span className="text-sm font-medium text-muted-foreground">Organization ID (for SSO)</span>
                        <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
                          {(() => {
                            const registrationData = localStorage.getItem("organizationRegistration");
                            if (registrationData) {
                              const data = JSON.parse(registrationData);
                              return data.id || 'Loading...';
                            }
                            return 'Loading...';
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use this ID for SSO configuration and API integrations
                        </p>
                      </div>
                     
                     {(() => {
                       const registrationData = localStorage.getItem("organizationRegistration");
                       if (registrationData) {
                         const data = JSON.parse(registrationData);
                         if (data.credentials?.tempPassword) {
                           return (
                             <div className="text-left">
                               <span className="text-sm font-medium text-muted-foreground">Temporary Password</span>
                               <div className="font-mono text-lg font-bold bg-background p-3 rounded border mt-1 text-green-600 text-center">
                                 {data.credentials.tempPassword}
                               </div>
                               <p className="text-xs text-muted-foreground mt-2 text-center">
                                 Use this password for your first login
                               </p>
                             </div>
                           );
                         }
                       }
                       return (
                         <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                           <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                             <strong>Important:</strong> You will receive an email with your temporary password. 
                             Please change it after your first login.
                           </p>
                         </div>
                       );
                     })()}
                   </CardContent>
                 </Card>

                 {/* Next Steps */}
                 <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
                   <div className="flex items-start gap-4">
                     <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                     <div className="text-left">
                       <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-3">What's Next?</h4>
                       <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                         <li className="flex items-start gap-2">
                           <span className="text-blue-600 font-bold">1.</span>
                           <span>Check your email for login credentials</span>
                         </li>
                         <li className="flex items-start gap-2">
                           <span className="text-blue-600 font-bold">2.</span>
                           <span>Sign in to your organization dashboard</span>
                         </li>
                         <li className="flex items-start gap-2">
                           <span className="text-blue-600 font-bold">3.</span>
                           <span>Invite team members to your organization</span>
                         </li>
                         <li className="flex items-start gap-2">
                           <span className="text-blue-600 font-bold">4.</span>
                           <span>Configure additional security settings</span>
                         </li>
                       </ul>
                     </div>
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                   <Button onClick={() => router.push('/login')} size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                     Sign In Now
                   </Button>
                   <Button variant="outline" onClick={() => router.push('/')} size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                     Go to Dashboard
                   </Button>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

                {/* Enhanced Navigation Buttons */}
        {currentStep !== 'complete' && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0 || isFormDisabled}
              className="w-full sm:w-auto order-2 sm:order-1 h-12 px-6 text-base font-medium transition-all duration-200 hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!validateCurrentStep() || isSubmitting || isFormDisabled}
              className="w-full sm:w-auto order-1 sm:order-2 h-12 px-8 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : currentStep === 'byoid' || (currentStep === 'pricing' && orgForm.selectedPlan === 'free') ? (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 