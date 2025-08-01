'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Building2, 
  Globe, 
  Shield, 
  Users, 
  ArrowRight,
  Copy,
  ExternalLink,
  Settings,
  Key
} from "lucide-react";
import { appConfig } from '@/lib/app-config';

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
  id?: string;
  tenantId?: string;
  status?: string;
  idpConfig?: {
    provider: string;
    clientId: string;
    domain: string;
  };
}

export default function SetupCompletePage() {
  const router = useRouter();
  const [registrationData, setRegistrationData] = React.useState<OrganizationForm | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("organizationRegistration");
      if (stored) {
        setRegistrationData(JSON.parse(stored));
      }
    }
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration details...</p>
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Setup Complete!</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Your organization has been successfully registered. You can now access your dashboard and start managing your remote infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Organization Information */}
              <Card className="border-green-200 dark:border-green-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Organization Information
                  </CardTitle>
                  <CardDescription>
                    Your organization has been successfully created and is ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
                       <div className="flex items-center gap-2">
                         <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1 min-w-0 break-all">
                           {registrationData.id}
                         </code>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => copyToClipboard(registrationData.id || '', 'orgId')}
                           className="h-8 w-8 p-0 flex-shrink-0"
                         >
                           <Copy className={`h-4 w-4 ${copied === 'orgId' ? 'text-green-600' : ''}`} />
                         </Button>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Tenant ID</label>
                       <div className="flex items-center gap-2">
                         <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1 min-w-0 break-all">
                           {registrationData.tenantId}
                         </code>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => copyToClipboard(registrationData.tenantId || '', 'tenantId')}
                           className="h-8 w-8 p-0 flex-shrink-0"
                         >
                           <Copy className={`h-4 w-4 ${copied === 'tenantId' ? 'text-green-600' : ''}`} />
                         </Button>
                       </div>
                     </div>

                                         <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Domain</label>
                       <div className="flex items-center gap-2">
                         <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                         <span className="font-medium break-words">{registrationData.domain}</span>
                       </div>
                     </div>

                                         <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Status</label>
                       <div className="flex items-center">
                         <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 inline-flex items-center">
                           <CheckCircle className="w-3 h-3 mr-1" />
                           {registrationData.status || 'Active'}
                         </Badge>
                       </div>
                     </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Identity Provider Configuration */}
               {registrationData.idpConfig && (
                 <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Identity Provider Configuration
                    </CardTitle>
                    <CardDescription>
                      Your SSO configuration details for secure authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                             <div className="space-y-2">
                         <label className="text-sm font-medium text-muted-foreground">IdP Provider</label>
                         <div className="flex items-center gap-2">
                           <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                           <span className="font-medium capitalize break-words">{registrationData.idpConfig.provider}</span>
                         </div>
                       </div>

                                             <div className="space-y-2">
                         <label className="text-sm font-medium text-muted-foreground">Client ID</label>
                         <div className="flex items-center gap-2">
                           <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                           <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1 min-w-0 break-all">
                             {registrationData.idpConfig.clientId}
                           </code>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => copyToClipboard(registrationData.idpConfig!.clientId, 'clientId')}
                             className="h-8 w-8 p-0 flex-shrink-0"
                           >
                             <Copy className={`h-4 w-4 ${copied === 'clientId' ? 'text-green-600' : ''}`} />
                           </Button>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )}

                             {/* Next Steps */}
               <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                  <CardDescription>
                    Here are the recommended next steps to get started with your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Access Your Dashboard</h4>
                        <p className="text-sm text-muted-foreground">
                          Log in to your organization dashboard to start managing users, hosts, and settings.
                        </p>
                      </div>
                    </div>

                                         <div className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                         <span className="text-xs font-bold text-primary">2</span>
                       </div>
                       <div>
                         <h4 className="font-medium">
                           {registrationData.selectedPlan === 'free' ? 'Configure SSO (Optional)' : 'Configure BYOID (Recommended)'}
                         </h4>
                         <p className="text-sm text-muted-foreground">
                           {registrationData.selectedPlan === 'free' 
                             ? 'Set up Single Sign-On with your identity provider for enhanced security.'
                             : 'Configure your own Identity Provider for enterprise-grade SSO integration.'
                           }
                         </p>
                       </div>
                     </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Add Your First Hosts</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect your remote servers and infrastructure to start monitoring and management.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 min-w-0">
                             {/* Quick Actions */}
               <Card className="overflow-hidden">
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
                   
                   {registrationData.selectedPlan !== 'free' && (
                     <Button 
                       variant="outline" 
                       onClick={() => router.push('/byoid-setup')}
                       className="w-full justify-start"
                       size="lg"
                     >
                       <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                       <span className="truncate">Configure BYOID</span>
                     </Button>
                   )}
                   
                   <Button 
                     variant="outline" 
                     onClick={() => router.push('/tenant')}
                     className="w-full justify-start"
                     size="lg"
                   >
                     <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                     <span className="truncate">Manage Organization</span>
                   </Button>
                </CardContent>
              </Card>

                             {/* Organization Details */}
               <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                                     <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Name:</span>
                     <div className="text-sm font-medium break-words">{registrationData.name}</div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Industry:</span>
                     <div className="text-sm font-medium break-words">{registrationData.industry}</div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Size:</span>
                     <div className="text-sm font-medium break-words">{registrationData.size}</div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Employees:</span>
                     <div className="text-sm font-medium break-words">{registrationData.expectedUsers}</div>
                   </div>
                   <Separator />
                   <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Contact:</span>
                     <div className="text-sm font-medium break-words">{registrationData.contactName}</div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-sm text-muted-foreground">Email:</span>
                     <div className="text-sm font-medium break-words">{registrationData.contactEmail}</div>
                   </div>
                </CardContent>
              </Card>

                                                           {/* Support - Only show if support data is available */}
                {(appConfig.support.email || appConfig.support.website || appConfig.support.documentation) && (
                  <Card className="overflow-hidden">
                   <CardHeader>
                     <CardTitle className="text-lg">Need Help?</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-3">
                     <p className="text-sm text-muted-foreground">
                       Our support team is here to help you get started and answer any questions.
                     </p>
                     <Button variant="outline" size="sm" className="w-full">
                       <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                       <span className="truncate">Contact Support</span>
                     </Button>
                   </CardContent>
                 </Card>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 