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
import { apiService } from '@/lib/api-service';
import { useHeader } from '@/contexts/header-context';

interface BYOIDForm {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
}

const supportedProviders = [
  { id: 'openid-connect', name: 'OpenID Connect', description: 'Standard OpenID Connect Protocol' }
];

export default function BYOIDSetupPage() {
  const router = useRouter();
  const { showHeader } = useHeader();
  const [formData, setFormData] = React.useState<BYOIDForm>({
    issuerUrl: '',
    clientId: '',
    clientSecret: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [organizationData, setOrganizationData] = React.useState<any>(null);
  const [isDiscovering, setIsDiscovering] = React.useState(false);
  const [discoveryResult, setDiscoveryResult] = React.useState<any>(null);
  const [discoveryError, setDiscoveryError] = React.useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = React.useState(true);
  const [isCheckingApi, setIsCheckingApi] = React.useState(true);

  // Check if form is valid and ready for submission
  const isFormValid = React.useMemo(() => {
    return (
      formData.issuerUrl.trim() !== '' &&
      formData.clientId.trim() !== '' &&
      formData.clientSecret.trim() !== '' &&
      discoveryResult !== null &&
      !discoveryError
    );
  }, [formData, discoveryResult, discoveryError]);

  // Show header on byoid-setup page
  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

  // Check API availability on component mount
  React.useEffect(() => {
    const checkApiAvailability = async () => {
      setIsCheckingApi(true);
      try {
        // Try to get organizations to check if API is available
        await apiService.getOrganizations();
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

  React.useEffect(() => {
    // Load organization data from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("organizationRegistration");
      if (stored) {
        const data = JSON.parse(stored);
        setOrganizationData(data);
        

      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the external BYOID setup API
      const result = await apiService.submitBYOIDSetup({
        ...formData,
        organizationId: organizationData?.id,
        organizationName: organizationData?.name,
        organizationDomain: organizationData?.domain
      });

      // Show success message
      apiService.showSuccess('BYOID setup submitted successfully!');
      
      // Save BYOID setup data
      localStorage.setItem("byoidSetup", JSON.stringify(formData));
      
      // Redirect to success page
      router.push('/byoid-setup-complete');
    } catch (error) {
      console.error('BYOID setup error:', error);
      // Error notification is already handled by apiService
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BYOIDForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-discover when issuer URL changes
    if (field === 'issuerUrl' && value.trim()) {
      performDiscovery(value.trim());
    }
  };

  const performDiscovery = async (issuerUrl: string) => {
    setIsDiscovering(true);
    setDiscoveryError(null);
    setDiscoveryResult(null);

    try {
      // Normalize issuer URL
      let normalizedUrl = issuerUrl;
      if (!normalizedUrl.endsWith('/')) {
        normalizedUrl += '/';
      }
      
      // Add .well-known/openid-configuration
      const discoveryUrl = `${normalizedUrl}.well-known/openid-configuration`;
      
      const response = await fetch(discoveryUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.status} ${response.statusText}`);
      }
      
      const config = await response.json();
      setDiscoveryResult(config);
      
      console.log('OpenID Connect Discovery Result:', config);
      
    } catch (error) {
      console.error('Discovery error:', error);
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setDiscoveryError('CORS error: Unable to access the discovery endpoint. Please check the URL or try a different IdP.');
      } else {
        setDiscoveryError(error instanceof Error ? error.message : 'Discovery failed');
      }
    } finally {
      setIsDiscovering(false);
    }
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Loading State */}
        {isCheckingApi && (
          <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Checking Service Status
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Verifying connection to BYOID setup service...
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* API Status Check */}
        {!isCheckingApi && !isApiAvailable && (
          <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Service Unavailable
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Unable to connect to the BYOID setup service. Please check your connection and try again later.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
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
                     <h1 className="text-3xl font-bold mb-2">Configure Your OpenID Connect Identity Provider</h1>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Set up OpenID Connect with your Identity Provider for enhanced security
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

        <form onSubmit={handleSubmit} className={`space-y-8 ${isCheckingApi || !isApiAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* IdP Provider Selection */}
          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Settings className="w-5 h-5" />
                 OpenID Connect Configuration
               </CardTitle>
               <CardDescription>
                 Provide your OpenID Connect configuration details
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                             

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="issuerUrl">Issuer URL</Label>
                   <Input
                     id="issuerUrl"
                     value={formData.issuerUrl}
                     onChange={(e) => handleInputChange('issuerUrl', e.target.value)}
                     placeholder="https://your-idp.com"
                     required
                     disabled={isCheckingApi || !isApiAvailable}
                     tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
                   />
                                       <p className="text-xs text-muted-foreground">
                      The OpenID Connect issuer URL
                    </p>
                    {isDiscovering && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Discovering OpenID Connect configuration...
                      </div>
                    )}
                    {discoveryError && (
                      <div className="text-xs text-red-600">
                        ⚠️ {discoveryError}
                      </div>
                    )}
                    {discoveryResult && (
                      <div className="text-xs text-green-600">
                        ✅ Discovery successful
                      </div>
                    )}
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="clientId">Client ID</Label>
                   <Input
                     id="clientId"
                     value={formData.clientId}
                     onChange={(e) => handleInputChange('clientId', e.target.value)}
                     placeholder="your-client-id"
                     required
                     disabled={isCheckingApi || !isApiAvailable}
                     tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
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
                   value={formData.clientSecret}
                   onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                   placeholder="your-client-secret"
                   required
                   disabled={isCheckingApi || !isApiAvailable}
                   tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
                 />
                                    <p className="text-xs text-muted-foreground">
                                           The client secret configured in your IdP
                   </p>
               </div>
                         </CardContent>
           </Card>

           {/* Discovery Results */}
           {discoveryResult && (
             <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                   <CheckCircle className="w-5 h-5" />
                   OpenID Connect Discovery Results
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div>
                       <span className="font-medium text-green-800 dark:text-green-200">Issuer:</span>
                       <div className="text-green-700 dark:text-green-300 break-all">{discoveryResult.issuer}</div>
                     </div>
                     <div>
                       <span className="font-medium text-green-800 dark:text-green-200">Authorization Endpoint:</span>
                       <div className="text-green-700 dark:text-green-300 break-all">{discoveryResult.authorization_endpoint}</div>
                     </div>
                     <div>
                       <span className="font-medium text-green-800 dark:text-green-200">Token Endpoint:</span>
                       <div className="text-green-700 dark:text-green-300 break-all">{discoveryResult.token_endpoint}</div>
                     </div>
                     <div>
                       <span className="font-medium text-green-800 dark:text-green-200">Userinfo Endpoint:</span>
                       <div className="text-green-700 dark:text-green-300 break-all">{discoveryResult.userinfo_endpoint}</div>
                     </div>
                   </div>
                   {discoveryResult.scopes_supported && (
                     <div>
                       <span className="font-medium text-green-800 dark:text-green-200">Supported Scopes:</span>
                       <div className="text-green-700 dark:text-green-300">{discoveryResult.scopes_supported.join(', ')}</div>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           )}

           {/* Submit Button */}
          <div className="flex justify-center">
                         <Button 
               type="submit" 
               size="lg" 
               disabled={isSubmitting || !isFormValid || isCheckingApi || !isApiAvailable}
               className="px-8"
             >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : isCheckingApi ? (
                <>
                  Checking Service...
                </>
              ) : !isApiAvailable ? (
                <>
                  Service Unavailable
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit OpenID Connect Configuration
                </>
              )}
             </Button>
             
           </div>
        </form>
      </div>
    </div>
  );
} 