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
  Settings,
  ArrowRight,
  FileText,
  Globe,
  Key
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
          <p className="text-muted-foreground">Loading OpenID Connect setup details...</p>
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">OpenID Connect Setup Complete!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your OpenID Connect configuration has been automatically configured and is ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Summary */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  OpenID Connect Configuration
                </CardTitle>
                <CardDescription>
                  Your automatically configured OpenID Connect settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm text-muted-foreground">Issuer URL</Label>
                     <div className="font-mono text-sm bg-muted p-3 rounded border">
                       <div className="break-all leading-relaxed">{byoidData.issuerUrl}</div>
                     </div>
                   </div>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Client ID</Label>
                        <div className="font-mono text-sm break-all bg-muted p-2 rounded">{byoidData.clientId}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-muted p-2 rounded min-h-[40px]">
                          <CheckCircle className="w-4 h-4" />
                          Configuration validated and active
                        </div>
                      </div>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* What's Available Now */}
            <Card>
              <CardHeader>
                <CardTitle>What's Available Now</CardTitle>
                <CardDescription>
                  Your organization can now use OpenID Connect for authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Single Sign-On (SSO)</h4>
                      <p className="text-sm text-muted-foreground">
                        Users can now sign in using your Identity Provider instead of separate credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Key className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Automatic User Provisioning</h4>
                      <p className="text-sm text-muted-foreground">
                        User accounts are automatically created and managed through your IdP.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Settings className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Centralized Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage user access and permissions through your Identity Provider dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Here's what you can do now
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Test the Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Try signing in with your Identity Provider to verify everything works correctly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Configure User Groups</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up user groups and roles in your Identity Provider for better access control.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Settings className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Manage Your Organization</h4>
                      <p className="text-sm text-muted-foreground">
                        Access your organization dashboard to manage users, settings, and monitor usage.
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push('/login')} 
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

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/login')}
                  className="w-full justify-start"
                  size="lg"
                >
                  <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Test SSO Login</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 