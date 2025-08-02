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
  User,
  Building2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { appConfig } from '@/lib/app-config';

export default function APIDemoPage() {
  const router = useRouter();
  const [tenantInfo, setTenantInfo] = React.useState<any>(null);
  const [byoidConfig, setByoidConfig] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTenant = localStorage.getItem("tenantInfo");
      const storedByoid = localStorage.getItem("byoidSetup");
      
      if (storedTenant) {
        setTenantInfo(JSON.parse(storedTenant));
      }
      if (storedByoid) {
        setByoidConfig(JSON.parse(storedByoid));
      }
    }
  }, []);

  if (!tenantInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication details...</p>
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
          <h1 className="text-3xl font-bold mb-2">Authentication Successful!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You have been successfully authenticated through your Identity Provider
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Authentication Summary */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  OpenID Connect Authentication
                </CardTitle>
                <CardDescription>
                  Your authentication flow completed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Organization</span>
                    <div className="font-medium">{tenantInfo.name}</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Domain</span>
                    <div className="font-medium">{tenantInfo.domain}</div>
                  </div>
                </div>
                {byoidConfig && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Identity Provider</span>
                    <div className="font-mono text-sm break-all bg-muted p-2 rounded">
                      {byoidConfig.issuerUrl}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Authentication validated and successful
                </div>
              </CardContent>
            </Card>

            {/* What This Means */}
            <Card>
              <CardHeader>
                <CardTitle>What Just Happened?</CardTitle>
                <CardDescription>
                  Your OpenID Connect authentication flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ExternalLink className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Redirected to Your IdP</h4>
                      <p className="text-sm text-muted-foreground">
                        You were redirected to your Identity Provider for authentication.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Authenticated Successfully</h4>
                      <p className="text-sm text-muted-foreground">
                        Your Identity Provider verified your credentials and returned you to the application.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Secure Session Established</h4>
                      <p className="text-sm text-muted-foreground">
                        A secure session has been established using OpenID Connect tokens.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Organization:</span>
                  <div className="text-sm font-medium break-words">{tenantInfo.name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Domain:</span>
                  <div className="text-sm font-medium break-words">{tenantInfo.domain}</div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Authenticated
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
                  onClick={() => router.push('/')} 
                  className="w-full justify-start"
                  size="lg"
                >
                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Go to Dashboard</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/tenant')}
                  className="w-full justify-start"
                  size="lg"
                >
                  <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Sign Out</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 