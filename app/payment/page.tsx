'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Shield,
  Lock,
  Building2,
  Users,
  Calendar,
  CreditCard as CreditCardIcon,
  Check
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { pricingPlans, calculateMonthlyCost } from '@/lib/pricing-plans';
import { useRegistrationGuard } from '@/hooks/use-registration-guard';

interface PaymentForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

interface OrganizationData {
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

export default function PaymentPage() {
  const router = useRouter();
  const { registrationData: organizationData, isLoading: isLoadingData, isValidAccess } = useRegistrationGuard();
  const [paymentForm, setPaymentForm] = React.useState<PaymentForm>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<PaymentForm>>({});

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year.toString(), label: year.toString() };
  });

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {};

    if (!paymentForm.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!paymentForm.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }

    if (!paymentForm.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }

    if (!paymentForm.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentForm.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!paymentForm.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    if (!paymentForm.billingCity.trim()) {
      newErrors.billingCity = 'City is required';
    }

    if (!paymentForm.billingState.trim()) {
      newErrors.billingState = 'State is required';
    }

    if (!paymentForm.billingZip.trim()) {
      newErrors.billingZip = 'ZIP code is required';
    }

    if (!paymentForm.acceptTerms) {
      newErrors.acceptTerms = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentForm, value: string | boolean) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    handleInputChange('cardNumber', formatted);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update registration data with payment information and redirect to setup-complete
      if (typeof window !== "undefined" && organizationData) {
        const updatedRegistrationData = {
          ...organizationData,
          paymentCompleted: true,
          paymentTimestamp: new Date().toISOString(),
          paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        localStorage.setItem("organizationRegistration", JSON.stringify(updatedRegistrationData));
      }

      // Redirect to success page
      router.push("/setup-complete");
      
    } catch (err) {
      console.error('Payment error:', err);
      // In a real app, you'd show an error message
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData || !organizationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if this is a free plan - redirect to setup-complete
  const selectedPlan = pricingPlans.find(plan => plan.id === organizationData.selectedPlan);
  if (selectedPlan?.price === 0) {
    router.push('/setup-complete');
    return null;
  }
        const isUnlimited = selectedPlan.maxUsers === -1;
        const maxUsersForPlan = isUnlimited ? 1000 : selectedPlan.maxUsers;
        const adjustedUsers = Math.min(organizationData.expectedUsers, maxUsersForPlan);
        const totalMonthly = calculateMonthlyCost(organizationData.selectedPlan, organizationData.expectedUsers);

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
              <CreditCard className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Complete Your Registration</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Secure payment to activate your {appConfig.name} account for {organizationData.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Your payment information is encrypted and secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Card Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            value={paymentForm.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={errors.cardNumber ? 'border-red-500' : ''}
                          />
                          {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryMonth">Month *</Label>
                            <Select value={paymentForm.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                              <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.expiryMonth && <p className="text-sm text-red-500">{errors.expiryMonth}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="expiryYear">Year *</Label>
                            <Select value={paymentForm.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                              <SelectTrigger className={errors.expiryYear ? 'border-red-500' : ''}>
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.expiryYear && <p className="text-sm text-red-500">{errors.expiryYear}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              value={paymentForm.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              className={errors.cvv ? 'border-red-500' : ''}
                            />
                            {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardholderName">Cardholder Name *</Label>
                          <Input
                            id="cardholderName"
                            value={paymentForm.cardholderName}
                            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                            placeholder="John Doe"
                            className={errors.cardholderName ? 'border-red-500' : ''}
                          />
                          {errors.cardholderName && <p className="text-sm text-red-500">{errors.cardholderName}</p>}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Billing Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress">Address *</Label>
                          <Input
                            id="billingAddress"
                            value={paymentForm.billingAddress}
                            onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                            placeholder="123 Business St"
                            className={errors.billingAddress ? 'border-red-500' : ''}
                          />
                          {errors.billingAddress && <p className="text-sm text-red-500">{errors.billingAddress}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCity">City *</Label>
                            <Input
                              id="billingCity"
                              value={paymentForm.billingCity}
                              onChange={(e) => handleInputChange('billingCity', e.target.value)}
                              placeholder="New York"
                              className={errors.billingCity ? 'border-red-500' : ''}
                            />
                            {errors.billingCity && <p className="text-sm text-red-500">{errors.billingCity}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="billingState">State *</Label>
                            <Input
                              id="billingState"
                              value={paymentForm.billingState}
                              onChange={(e) => handleInputChange('billingState', e.target.value)}
                              placeholder="NY"
                              className={errors.billingState ? 'border-red-500' : ''}
                            />
                            {errors.billingState && <p className="text-sm text-red-500">{errors.billingState}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingZip">ZIP Code *</Label>
                            <Input
                              id="billingZip"
                              value={paymentForm.billingZip}
                              onChange={(e) => handleInputChange('billingZip', e.target.value)}
                              placeholder="10001"
                              className={errors.billingZip ? 'border-red-500' : ''}
                            />
                            {errors.billingZip && <p className="text-sm text-red-500">{errors.billingZip}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="billingCountry">Country</Label>
                            <Select value={paymentForm.billingCountry} onValueChange={(value) => handleInputChange('billingCountry', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          checked={paymentForm.acceptTerms}
                          onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="acceptTerms" className="text-sm">
                            I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a> *
                          </Label>
                          {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptMarketing"
                          checked={paymentForm.acceptMarketing}
                          onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="acceptMarketing" className="text-sm">
                            I would like to receive marketing communications about {appConfig.name} products and services
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/register')}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Registration
                      </Button>
                      
                      <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Payment
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
              {/* Organization Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Organization Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Organization:</span>
                      <span className="text-sm font-medium">{organizationData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Domain:</span>
                      <span className="text-sm font-medium">{organizationData.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Industry:</span>
                      <span className="text-sm font-medium">{organizationData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Size:</span>
                      <span className="text-sm font-medium">{organizationData.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm font-medium">{organizationData.contactName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pricing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Plan:</span>
                      <span className="text-sm font-medium">{selectedPlan.name}</span>
                    </div>
                                         <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Users:</span>
                       <span className="text-sm font-medium">
                         {selectedPlan.maxUsers === -1 ? 'Unlimited' : adjustedUsers}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Organizational Units:</span>
                       <span className="text-sm font-medium">
                         {selectedPlan.maxOrganizationalUnits === -1 ? 'Unlimited' : selectedPlan.maxOrganizationalUnits}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Hosts:</span>
                       <span className="text-sm font-medium">
                         {selectedPlan.maxHosts === -1 ? 'Unlimited' : selectedPlan.maxHosts}
                       </span>
                     </div>
                                         <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Price per user:</span>
                       <span className="text-sm font-medium">
                         {selectedPlan.price === 0 ? 'Free' : `$${selectedPlan.price}/month`}
                       </span>
                     </div>
                     <Separator />
                     <div className="flex justify-between font-medium">
                       <span>Monthly total:</span>
                       <span>
                         {selectedPlan.price === 0 ? 'Free' : `$${totalMonthly}/month`}
                       </span>
                     </div>
                  </div>
                  
                                     {selectedPlan.price > 0 && (
                     <Badge variant="secondary" className="w-full justify-center">
                       <Calendar className="w-3 h-3 mr-1" />
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

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">PCI DSS compliant</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">No card data stored</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 