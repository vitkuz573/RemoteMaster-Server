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
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  additionalNotes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const supportedProviders = [
  { id: 'keycloak', name: 'Keycloak', description: 'Keycloak Identity Provider' }
];

export default function BYOIDSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<BYOIDForm>({
    provider: '',
    issuerUrl: '',
    clientId: '',
    clientSecret: '',
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
                     <h1 className="text-3xl font-bold mb-2">Configure Your Keycloak Identity Provider</h1>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Set up OpenID Connect with your Keycloak instance for enhanced security
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
                 Keycloak OpenID Connect Configuration
               </CardTitle>
               <CardDescription>
                 Provide your Keycloak OpenID Connect configuration details
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="space-y-2">
                 <Label htmlFor="provider">Identity Provider</Label>
                 <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                   <Shield className="w-4 h-4 text-muted-foreground" />
                   <span className="font-medium">Keycloak</span>
                   <Badge variant="secondary" className="ml-auto">OpenID Connect</Badge>
                 </div>
                 <p className="text-xs text-muted-foreground">
                   Currently supporting Keycloak OpenID Connect integration
                 </p>
               </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="issuerUrl">Issuer URL</Label>
                   <Input
                     id="issuerUrl"
                     value={formData.issuerUrl}
                     onChange={(e) => handleInputChange('issuerUrl', e.target.value)}
                     placeholder="https://your-keycloak.com/auth/realms/your-realm"
                     required
                   />
                   <p className="text-xs text-muted-foreground">
                     The OpenID Connect issuer URL (usually your Keycloak realm URL)
                   </p>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="clientId">Client ID</Label>
                   <Input
                     id="clientId"
                     value={formData.clientId}
                     onChange={(e) => handleInputChange('clientId', e.target.value)}
                     placeholder="your-client-id"
                     required
                   />
                   <p className="text-xs text-muted-foreground">
                     The client ID configured in your Keycloak realm
                   </p>
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="clientSecret">Client Secret</Label>
                 <Input
                   id="clientSecret"
                   type="password"
                   value={formData.clientSecret}
                   onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                   placeholder="your-client-secret"
                   required
                 />
                 <p className="text-xs text-muted-foreground">
                   The client secret configured in your Keycloak realm
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
                     <li>• Our team will review your Keycloak configuration within 24-48 hours</li>
                     <li>• We'll contact you to confirm the setup and provide next steps</li>
                     <li>• Once configured, you'll receive detailed setup instructions</li>
                     <li>• Your organization will be able to use OpenID Connect for authentication</li>
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
                                     Submit Keycloak Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 