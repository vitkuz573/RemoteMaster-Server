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
  FileText
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { pricingPlans, calculateMonthlyCost } from '@/lib/pricing-plans';
import { mockApiService } from '@/lib/api-service-mock';
import { isMockApiEnabled } from '@/lib/api-config';
import { useHeader } from '@/contexts/header-context';

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
}

type WizardStep = 'organization' | 'contact' | 'pricing' | 'byoid' | 'complete';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Government',
  'Non-profit',
  'Other'
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

export function SetupWizard() {
  const router = useRouter();
  const { showHeader } = useHeader();
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('organization');
  const [isApiAvailable, setIsApiAvailable] = React.useState(true);
  const [isCheckingApi, setIsCheckingApi] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Organization form data
  const [orgForm, setOrgForm] = React.useState<OrganizationForm>({
    name: '',
    domain: '',
    industry: '',
    size: '',
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

  // Show header on setup wizard
  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

  // Check API availability on component mount
  React.useEffect(() => {
    const checkApiAvailability = async () => {
      setIsCheckingApi(true);
      try {
        await mockApiService.getOrganizations();
        setIsApiAvailable(true);
      } catch (err) {
        console.error('API check failed:', err);
        setIsApiAvailable(false);
      } finally {
        setIsCheckingApi(false);
      }
    };

    checkApiAvailability();
  }, []);

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
    {
      key: 'byoid',
      title: 'Identity Provider',
      description: 'Configure OpenID Connect (Optional)',
      icon: <Shield className="w-4 h-4" />
    },
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

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'organization':
        return orgForm.name.trim() !== '' && 
               orgForm.domain.trim() !== '' && 
               orgForm.industry !== '' && 
               orgForm.size !== '';
      case 'contact':
        return orgForm.contactName.trim() !== '' && 
               orgForm.contactEmail.trim() !== '' && 
               orgForm.contactPhone.trim() !== '' && 
               orgForm.address.trim() !== '';
      case 'pricing':
        return orgForm.selectedPlan !== '';
      case 'byoid':
        return true; // Optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep === 'byoid') {
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
      const result = await mockApiService.registerOrganization(orgForm);

      // Save organization data
      if (typeof window !== "undefined") {
        const registrationData = {
          ...orgForm,
          ...result.organization,
          registrationTimestamp: new Date().toISOString(),
        };
        localStorage.setItem("organizationRegistration", JSON.stringify(registrationData));
      }

      mockApiService.showSuccess('Organization setup completed successfully!');
      setCurrentStep('complete');
      
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = pricingPlans.find(plan => plan.id === orgForm.selectedPlan) || pricingPlans[0];
  const totalMonthly = calculateMonthlyCost(orgForm.selectedPlan, orgForm.expectedUsers);

  // Show loading state while checking API
  if (isCheckingApi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking service status...</p>
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
              Unable to connect to the setup service. Please check your connection and try again later.
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Organization Setup Wizard</h1>
            <Badge variant="outline">Step {currentStepIndex + 1} of {steps.length}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index <= currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStepIndex ? <CheckCircle className="w-3 h-3" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStepIndex].icon}
              {steps[currentStepIndex].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStepIndex].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'organization' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={orgForm.name}
                      onChange={(e) => handleOrgInputChange('name', e.target.value)}
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain *</Label>
                    <Input
                      id="domain"
                      value={orgForm.domain}
                      onChange={(e) => handleOrgInputChange('domain', e.target.value)}
                      placeholder="acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={orgForm.industry} onValueChange={(value) => handleOrgInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size *</Label>
                    <Select value={orgForm.size} onValueChange={(value) => handleOrgInputChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Organization Description</Label>
                  <Textarea
                    id="description"
                    value={orgForm.description}
                    onChange={(e) => handleOrgInputChange('description', e.target.value)}
                    placeholder="Brief description of your organization..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={orgForm.contactName}
                      onChange={(e) => handleOrgInputChange('contactName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={orgForm.contactEmail}
                      onChange={(e) => handleOrgInputChange('contactEmail', e.target.value)}
                      placeholder="john@acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      value={orgForm.contactPhone}
                      onChange={(e) => handleOrgInputChange('contactPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedUsers">Organization Size (Employees)</Label>
                    <Input
                      id="expectedUsers"
                      type="number"
                      min="1"
                      max="10000"
                      value={orgForm.expectedUsers}
                      onChange={(e) => handleOrgInputChange('expectedUsers', parseInt(e.target.value) || 10)}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={orgForm.address}
                    onChange={(e) => handleOrgInputChange('address', e.target.value)}
                    placeholder="123 Business St, City, State, ZIP"
                    rows={2}
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
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        orgForm.selectedPlan === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => handleOrgInputChange('selectedPlan', plan.id)}
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
                  ))}
                </div>

                <Separator />

                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {selectedPlan.price === 0 ? 'Free' : `$${totalMonthly}`}
                  </div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
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
                        Configure your identity provider for enhanced security. You can skip this step and configure it later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issuerUrl">Issuer URL</Label>
                    <Input
                      id="issuerUrl"
                      value={byoidForm.issuerUrl}
                      onChange={(e) => handleByoidInputChange('issuerUrl', e.target.value)}
                      placeholder="https://your-idp.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      The OpenID Connect issuer URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={byoidForm.clientId}
                      onChange={(e) => handleByoidInputChange('clientId', e.target.value)}
                      placeholder="your-client-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      The client ID configured in your IdP
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={byoidForm.clientSecret}
                    onChange={(e) => handleByoidInputChange('clientSecret', e.target.value)}
                    placeholder="your-client-secret"
                  />
                  <p className="text-xs text-muted-foreground">
                    The client secret configured in your IdP
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Setup Complete!</h3>
                  <p className="text-muted-foreground">
                    Your organization "{orgForm.name}" has been successfully configured and is ready to use.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <div className="font-medium">{orgForm.name}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Domain:</span>
                        <div className="font-medium">{orgForm.domain}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Plan:</span>
                        <div className="font-medium">{selectedPlan.name}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Contact:</span>
                        <div className="font-medium">{orgForm.contactName}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <div className="font-medium">{orgForm.contactEmail}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <div className="font-medium">{orgForm.contactPhone}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push('/')} size="lg">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/login')} size="lg">
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 'complete' && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!validateCurrentStep() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : currentStep === 'byoid' ? (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 