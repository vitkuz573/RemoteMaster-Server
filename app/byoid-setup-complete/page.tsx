'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  Mail, 
  Phone,
  ArrowRight,
  FileText,
  Settings
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { Label } from "@/components/ui/label";

export default function BYOIDSetupCompletePage() {
  const router = useRouter();
  const [byoidData, setByoidData] = React.useState<any>(null);
  const [organizationData, setOrganizationData] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedByoid = localStorage.getItem("byoidSetup");
      const storedOrg = localStorage.getItem("organizationRegistration");
      
      if (storedByoid) {
        setByoidData(JSON.parse(storedByoid));
      }
      if (storedOrg) {
        setOrganizationData(JSON.parse(storedOrg));
      }
    }
  }, []);

  if (!byoidData || !organizationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BYOID setup details...</p>
        </div>
      </div>
    );
  }

  const getProviderName = (providerId: string) => {
    const providers: { [key: string]: string } = {
      'keycloak': 'Keycloak'
    };
    return providers[providerId] || providerId;
  };

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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
                     <h1 className="text-3xl font-bold mb-2">Keycloak Setup Submitted!</h1>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Your Keycloak OpenID Connect configuration has been submitted successfully. Our team will review and configure your SSO setup.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* BYOID Configuration Summary */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <Shield className="w-5 h-5 text-blue-600" />
                   Keycloak Configuration Summary
                 </CardTitle>
                 <CardDescription>
                   Your submitted Keycloak OpenID Connect configuration details
                 </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm text-muted-foreground">Identity Provider</Label>
                     <div className="font-medium">{getProviderName(byoidData.provider)}</div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm text-muted-foreground">Issuer URL</Label>
                     <div className="font-mono text-sm break-all">{byoidData.issuerUrl}</div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm text-muted-foreground">Client ID</Label>
                     <div className="font-mono text-sm break-all">{byoidData.clientId}</div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm text-muted-foreground">Client Secret</Label>
                     <div className="font-mono text-sm">••••••••••••••••</div>
                   </div>
                 </div>
                
                {byoidData.additionalNotes && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Additional Notes</Label>
                    <div className="text-sm bg-muted p-3 rounded-md">{byoidData.additionalNotes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                                 <CardTitle>What Happens Next?</CardTitle>
                 <CardDescription>
                   Here's what to expect during the Keycloak setup process
                 </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                                             <h4 className="font-medium">Review Period (24-48 hours)</h4>
                       <p className="text-sm text-muted-foreground">
                         Our team will review your Keycloak configuration and validate the provided details.
                       </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Contact & Confirmation</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll contact you at {byoidData.contactEmail} to confirm the setup and discuss next steps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Settings className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                                             <h4 className="font-medium">Configuration & Testing</h4>
                       <p className="text-sm text-muted-foreground">
                         Our team will configure your Keycloak OpenID Connect integration and perform thorough testing.
                       </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                                             <h4 className="font-medium">Go Live & Documentation</h4>
                       <p className="text-sm text-muted-foreground">
                         Once configured, you'll receive detailed setup instructions and can start using OpenID Connect.
                       </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <div className="text-sm font-medium break-words">{organizationData.name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Domain:</span>
                  <div className="text-sm font-medium break-words">{organizationData.domain}</div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                    Pending Review
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <div className="text-sm font-medium break-words">{byoidData.contactName}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <div className="text-sm font-medium break-words">{byoidData.contactEmail}</div>
                </div>
                {byoidData.contactPhone && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <div className="text-sm font-medium break-words">{byoidData.contactPhone}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push('/tenant')} 
                  className="w-full justify-start"
                  size="lg"
                >
                  <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Go to Dashboard</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="w-full justify-start"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">View Documentation</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 