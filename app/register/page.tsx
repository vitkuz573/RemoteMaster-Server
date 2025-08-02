'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowRight, 
  Users,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { pricingPlans, calculateMonthlyCost } from '@/lib/pricing-plans';
import { apiService } from '@/lib/api-service';

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

export default function OrganizationRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<OrganizationForm>({
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof OrganizationForm, string>>>({});

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



  const selectedPlan = pricingPlans.find(plan => plan.id === formData.selectedPlan) || pricingPlans[0];
  const isUnlimited = selectedPlan.maxUsers === -1;
  const adjustedUsers = isUnlimited ? formData.expectedUsers : Math.min(formData.expectedUsers, selectedPlan.maxUsers);
  const totalMonthly = calculateMonthlyCost(formData.selectedPlan, formData.expectedUsers);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrganizationForm, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain (e.g., mycompany.com)';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.size) {
      newErrors.size = 'Company size is required';
    }

    if (!formData.selectedPlan) {
      newErrors.selectedPlan = 'Please select a pricing plan';
    }

    // Validate expected users (organization size, not system users)
    if (formData.expectedUsers < 1) {
      newErrors.expectedUsers = 'Expected users must be at least 1';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof OrganizationForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePlanChange = (planId: string) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
    // Clear error when user selects a plan
    if (errors.selectedPlan) {
      setErrors(prev => ({ ...prev, selectedPlan: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the external registration API
      const result = await apiService.registerOrganization(formData);

      // Save organization data to localStorage
      if (typeof window !== "undefined") {
        const registrationData = {
          ...formData,
          ...result.organization,
          registrationTimestamp: new Date().toISOString(),
        };
        localStorage.setItem("organizationRegistration", JSON.stringify(registrationData));
        
        // Also save the auth token if provided
        if (result.token) {
          localStorage.setItem("authToken", result.token);
        }
      }

      // Show success message
      alert(result.message || 'Registration successful!');

      // Redirect based on plan type
      if (selectedPlan.price === 0) {
        // Free plan - go directly to setup complete
        router.push("/setup-complete");
      } else {
        // Paid plan - go to payment page
        router.push("/payment");
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      alert(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{appConfig.shortName}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">{appConfig.name}</h1>
              <p className="text-xs text-muted-foreground">{appConfig.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Organization Registration</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with {appConfig.name} for your organization. Fill out the form below and we'll guide you through the setup process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Organization Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your organization to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Organization Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Organization Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Organization Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                            placeholder="Acme Corporation"
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="domain">Domain *</Label>
                          <Input
                            id="domain"
                            value={formData.domain}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('domain', e.target.value)}
                            placeholder="acme.com"
                            className={errors.domain ? 'border-red-500' : ''}
                          />
                          {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry *</Label>
                          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                            <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
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
                          {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="size">Company Size *</Label>
                          <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                            <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
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
                          {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Organization Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                          placeholder="Brief description of your organization..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Contact Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contact Name *</Label>
                          <Input
                            id="contactName"
                            value={formData.contactName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactName', e.target.value)}
                            placeholder="John Doe"
                            className={errors.contactName ? 'border-red-500' : ''}
                          />
                          {errors.contactName && <p className="text-sm text-red-500">{errors.contactName}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email *</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactEmail', e.target.value)}
                            placeholder="john@acme.com"
                            className={errors.contactEmail ? 'border-red-500' : ''}
                          />
                          {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Contact Phone *</Label>
                          <Input
                            id="contactPhone"
                            value={formData.contactPhone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className={errors.contactPhone ? 'border-red-500' : ''}
                          />
                          {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expectedUsers">Organization Size (Employees)</Label>
                          <Input
                            id="expectedUsers"
                            type="number"
                            min="1"
                            max="10000"
                            value={formData.expectedUsers}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('expectedUsers', parseInt(e.target.value) || 10)}
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                          placeholder="123 Business St, City, State, ZIP"
                          rows={2}
                          className={errors.address ? 'border-red-500' : ''}
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                      </div>
                    </div>

                    <Separator />

                    {/* Pricing Plans */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Pricing Plan
                      </h3>
                                           <p className="text-sm text-muted-foreground">
                       Select a pricing plan to determine the total monthly cost based on your expected number of users, organizational units, and hosts.
                     </p>
                      
                      {/* Responsive pricing plan selection */}
                      <div className="space-y-3">
                        {pricingPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.selectedPlan === plan.id
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-primary/50'
                            }`}
                            onClick={() => handlePlanChange(plan.id)}
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
                                   formData.selectedPlan === plan.id
                                     ? 'border-primary bg-primary'
                                     : 'border-muted hover:border-primary/50'
                                 }`}>
                                   {formData.selectedPlan === plan.id && (
                                     <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                   )}
                                 </div>
                               </div>
                             </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                            
                                                         {/* Feature display */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
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
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/tenant')}
                        disabled={isLoading}
                      >
                        Back to Login
                      </Button>
                      
                      <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {selectedPlan.price === 0 ? 'Create Free Account' : 'Continue to Payment'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">Multi-tenant Architecture</p>
                       <p className="text-sm text-muted-foreground">Isolated environments for each organization</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">Organizational Unit Management</p>
                       <p className="text-sm text-muted-foreground">Organize users into organizational units and teams</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">Host Management</p>
                       <p className="text-sm text-muted-foreground">Manage remote hosts and connections</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">SSO Integration</p>
                       <p className="text-sm text-muted-foreground">Support for major identity providers</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">24/7 Support</p>
                       <p className="text-sm text-muted-foreground">Dedicated support team</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                     <div>
                       <p className="font-medium">Security & Compliance</p>
                       <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
                     </div>
                   </div>
                </CardContent>
              </Card>

              {/* Pricing Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pricing Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedPlan.price === 0 ? 'Free' : `$${totalMonthly}`}
                    </div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                                                               <div className="flex justify-between">
                        <span>System Users:</span>
                        <span className="font-medium">
                          {selectedPlan.maxUsers === -1 ? 'Unlimited' : selectedPlan.maxUsers}
                        </span>
                      </div>
                     <div className="flex justify-between">
                       <span>Organizational Units:</span>
                       <span className="font-medium">
                         {selectedPlan.maxOrganizationalUnits === -1 ? 'Unlimited' : selectedPlan.maxOrganizationalUnits}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span>Hosts:</span>
                       <span className="font-medium">
                         {selectedPlan.maxHosts === -1 ? 'Unlimited' : selectedPlan.maxHosts}
                       </span>
                     </div>
                    <div className="flex justify-between">
                      <span>Price per user:</span>
                      <span className="font-medium">
                        {selectedPlan.price === 0 ? 'Free' : `$${selectedPlan.price}/month`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-sm">
                      <span>Total:</span>
                      <span>
                        {selectedPlan.price === 0 ? 'Free' : `$${totalMonthly}/month`}
                      </span>
                    </div>
                  </div>
                  
                  {selectedPlan.hasTrial && (
                    <Badge variant="secondary" className="w-full justify-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Free 30-day trial
                    </Badge>
                  )}
                  
                  {selectedPlan.price === 0 && (
                    <Badge variant="outline" className="w-full justify-center text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      No credit card required
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Our team is here to help you get started. Contact us for personalized assistance.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 