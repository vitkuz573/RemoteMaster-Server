'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Settings, 
  Globe, 
  Key, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft
} from "lucide-react";
import { appConfig } from '@/lib/app-config';

interface BYOIDForm {
  provider: string;
  entityId: string;
  ssoUrl: string;
  x509Certificate: string;
  nameIdFormat: string;
  additionalNotes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const supportedProviders = [
  { id: 'azure-ad', name: 'Microsoft Azure AD', description: 'Azure Active Directory' },
  { id: 'okta', name: 'Okta', description: 'Okta Identity Platform' },
  { id: 'google-workspace', name: 'Google Workspace', description: 'Google Workspace SSO' },
  { id: 'onelogin', name: 'OneLogin', description: 'OneLogin Identity Platform' },
  { id: 'ping-identity', name: 'Ping Identity', description: 'Ping Identity Platform' },
  { id: 'adfs', name: 'ADFS', description: 'Active Directory Federation Services' },
  { id: 'custom', name: 'Custom SAML', description: 'Custom SAML 2.0 Provider' }
];

const nameIdFormats = [
  { id: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress', name: 'Email Address' },
  { id: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified', name: 'Unspecified' },
  { id: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent', name: 'Persistent' },
  { id: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient', name: 'Transient' }
];

export default function BYOIDSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<BYOIDForm>({
    provider: '',
    entityId: '',
    ssoUrl: '',
    x509Certificate: '',
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    additionalNotes: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [organizationData, setOrganizationData] = React.useState<any>(null);

  React.useEffect(() => {
    // Load organization data from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("organizationRegistration");
      if (stored) {
        const data = JSON.parse(stored);
        setOrganizationData(data);
        
        // Pre-fill contact information
        setFormData(prev => ({
          ...prev,
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || ''
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would send the data to your backend
      // for processing and IdP configuration
      const response = await fetch('/api/byoid-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationId: organizationData?.id,
          organizationName: organizationData?.name,
          organizationDomain: organizationData?.domain
        }),
      });

      if (response.ok) {
        // Save BYOID setup data
        localStorage.setItem("byoidSetup", JSON.stringify(formData));
        
        // Redirect to success page
        router.push('/byoid-setup-complete');
      } else {
        throw new Error('Failed to submit BYOID setup');
      }
    } catch (error) {
      console.error('BYOID setup error:', error);
      alert('Failed to submit BYOID setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BYOIDForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!organizationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Configure Your Identity Provider</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set up Single Sign-On (SSO) with your own Identity Provider for enhanced security
          </p>
        </div>

        {/* Organization Info */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Organization</Label>
                <div className="font-medium">{organizationData.name}</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Domain</Label>
                <div className="font-medium">{organizationData.domain}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* IdP Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Identity Provider Configuration
              </CardTitle>
              <CardDescription>
                Select your Identity Provider and provide the required configuration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="provider">Identity Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => handleInputChange('provider', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your Identity Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{provider.name}</span>
                          <span className="text-sm text-muted-foreground">{provider.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entityId">Entity ID (Issuer)</Label>
                  <Input
                    id="entityId"
                    value={formData.entityId}
                    onChange={(e) => handleInputChange('entityId', e.target.value)}
                    placeholder="https://your-idp.com/saml/metadata"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The unique identifier for your IdP (usually the metadata URL)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssoUrl">SSO URL (Single Sign-On URL)</Label>
                  <Input
                    id="ssoUrl"
                    value={formData.ssoUrl}
                    onChange={(e) => handleInputChange('ssoUrl', e.target.value)}
                    placeholder="https://your-idp.com/saml/sso"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL where users will be redirected for authentication
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameIdFormat">Name ID Format</Label>
                <Select value={formData.nameIdFormat} onValueChange={(value) => handleInputChange('nameIdFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nameIdFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="x509Certificate">X.509 Certificate</Label>
                <Textarea
                  id="x509Certificate"
                  value={formData.x509Certificate}
                  onChange={(e) => handleInputChange('x509Certificate', e.target.value)}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;Your X.509 certificate here...&#10;-----END CERTIFICATE-----"
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The X.509 certificate used to verify SAML responses from your IdP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Provide contact details for our team to assist with the IdP configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information or special requirements..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">What happens next?</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Our team will review your IdP configuration within 24-48 hours</li>
                    <li>• We'll contact you to confirm the setup and provide next steps</li>
                    <li>• Once configured, you'll receive detailed setup instructions</li>
                    <li>• Your organization will be able to use SSO for authentication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit BYOID Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 