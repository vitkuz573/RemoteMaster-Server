'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  ArrowRight, 
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { useHeader } from '@/contexts/header-context';
import { apiService } from '@/lib/api-service';

export default function LoginPage() {
  const router = useRouter();
  const { showHeader } = useHeader();
  const [loginMode, setLoginMode] = React.useState<'sso' | 'credentials'>('sso');
  const [tenantId, setTenantId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isApiAvailable, setIsApiAvailable] = React.useState(true);
  const [isCheckingApi, setIsCheckingApi] = React.useState(true);

  // Application configuration (imported from centralized config)

  // Show header on login page
  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

  // Load organizations from external API
  React.useEffect(() => {
    const loadOrganizations = async () => {
      setIsCheckingApi(true);
      try {
        const data = await apiService.getOrganizations();
        const organizations = data.organizations || [];
        const tenants = organizations.map((org: any) => ({
          id: org.id,
          name: org.name,
          domain: org.domain,
          idp: org.idpConfig?.provider || 'Internal',
          byoidConfig: org.byoidConfig || null
        }));
        console.log('Loaded organizations:', tenants);
        setKnownTenants(tenants);
        setIsApiAvailable(true);
      } catch (err) {
        console.error('Failed to load organizations:', err);
        setIsApiAvailable(false);
      } finally {
        setIsCheckingApi(false);
      }
    };

    loadOrganizations();
  }, []);

  // Tenant registry will be fetched from API
  const [knownTenants, setKnownTenants] = React.useState<Array<{
    id: string, 
    name: string, 
    domain: string, 
    idp: string,
    byoidConfig?: {
      issuerUrl: string;
      clientId: string;
      status: string;
    } | null
  }>>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (loginMode === 'sso') {
      const trimmed = tenantId.trim().toLowerCase();
      
      if (!trimmed) {
        setError("Please enter your organization ID");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // Simulate tenant validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if tenant exists by ID or domain
        console.log('Searching for tenant:', trimmed);
        console.log('Available tenants:', knownTenants);
        const tenant = knownTenants.find(t => 
          t.id === trimmed || 
          t.domain === trimmed || 
          t.id.toLowerCase() === trimmed.toLowerCase() ||
          t.domain.toLowerCase() === trimmed.toLowerCase()
        );
        
        if (!tenant) {
          setError("Organization not found. Please check your organization ID or contact your administrator.");
          setIsLoading(false);
          return;
        }

        // Save tenant info to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("tenant", trimmed);
          localStorage.setItem("tenantInfo", JSON.stringify(tenant));
        }

        // Check if organization has BYOID configuration
        if (tenant.byoidConfig && tenant.byoidConfig.status === 'active') {
          console.log(`Redirecting to BYOID IdP: ${tenant.byoidConfig.issuerUrl} for tenant: ${tenant.name}`);
          
          // In a real implementation, this would redirect to the IdP's authorization endpoint
          // For demo purposes, we'll show a message and redirect to a demo page
          alert(`Redirecting to your Identity Provider: ${tenant.byoidConfig.issuerUrl}`);
          
          // Simulate SSO redirect delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo: redirect to a success page that simulates IdP authentication
          router.push("/api-demo");
        } else {
          // No BYOID configuration, redirect to main app
          console.log(`No BYOID config found for tenant: ${tenant.name}, redirecting to main app`);
          
          // Simulate SSO redirect delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirect to main dashboard
          router.push("/");
        }
        
      } catch (err) {
        setError("Unable to connect to authentication service. Please try again.");
        setIsLoading(false);
      }
    } else {
      // Credentials login
      if (!email.trim() || !password.trim() || !tenantId.trim()) {
        setError("Please fill in all fields");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // First check if organization exists
        const trimmedTenantId = tenantId.trim();
        const tenant = knownTenants.find(t => 
          t.id === trimmedTenantId || 
          t.domain === trimmedTenantId || 
          t.id.toLowerCase() === trimmedTenantId.toLowerCase() ||
          t.domain.toLowerCase() === trimmedTenantId.toLowerCase()
        );
        
        if (!tenant) {
          setError("Organization not found. Please check your organization ID or contact your administrator.");
          setIsLoading(false);
          return;
        }

        // Call the external login API
        const result = await apiService.login({
          email: email.trim(),
          password: password,
          domain: tenantId.trim()
        });

        // Save auth data to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("tenant", tenantId.trim());
        }

        // Show success message
        apiService.showSuccess(result.message || 'Login successful!');
        
        // Redirect to main dashboard
        router.push("/");
        
      } catch (err) {
        // Error notification is already handled by apiService
        setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        setIsLoading(false);
      }
    }
  };



  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/30">
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Sign in to your organization
            </h2>
            <p className="text-muted-foreground">
              Enter your organization ID to continue to {appConfig.name}
            </p>
          </div>

          {/* Login Mode Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={() => setLoginMode('sso')}
              disabled={isCheckingApi || !isApiAvailable}
              tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                loginMode === 'sso'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } ${isCheckingApi || !isApiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              SSO Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              disabled={isCheckingApi || !isApiAvailable}
              tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                loginMode === 'credentials'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } ${isCheckingApi || !isApiAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Credentials
            </button>
          </div>

          {/* Loading State */}
          {isCheckingApi && (
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Checking Service Status
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Verifying connection to authentication service...
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* API Status Check */}
          {!isCheckingApi && !isApiAvailable && (
            <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  API Unavailable
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Unable to connect to the authentication service. Please check your connection and try again later.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Main Form */}
          <Card className={`border-2 ${isCheckingApi || !isApiAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                {loginMode === 'sso' ? 'Organization Sign-In' : 'User Login'}
              </CardTitle>
              <CardDescription>
                {loginMode === 'sso' 
                  ? "You'll be redirected to your organization's identity provider"
                  : "Sign in with your email and password"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tenant-id" className="text-sm font-medium">
                    {loginMode === 'sso' ? 'Organization ID' : 'Domain'}
                  </Label>
                  <Input
                    id="tenant-id"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder={loginMode === 'sso' ? "your-organization-id" : "example.com"}
                    className="h-11"
                    autoComplete="organization"
                    autoFocus={!isCheckingApi && isApiAvailable}
                    disabled={isCheckingApi || !isApiAvailable}
                    tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
                  />
                  <p className="text-xs text-muted-foreground">
                    {loginMode === 'sso' 
                      ? "This is usually provided by your IT administrator"
                      : "Enter your organization's domain"
                    }
                  </p>
                </div>

                {loginMode === 'credentials' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="h-11"
                        autoComplete="email"
                        disabled={isCheckingApi || !isApiAvailable}
                        tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-11"
                        autoComplete="current-password"
                        disabled={isCheckingApi || !isApiAvailable}
                        tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading || isCheckingApi || !isApiAvailable}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {loginMode === 'sso' ? 'Connecting...' : 'Signing in...'}
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
                      {loginMode === 'sso' ? 'Continue' : 'Sign In'}
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>



          {/* Security Info */}
          <div className="text-center space-y-4">
            <Separator />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock size={14} />
              <span>Secured by enterprise SSO</span>
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground max-w-sm mx-auto space-y-1">
              <p>Your credentials are handled by your organization's identity provider.</p>
              <p>{appConfig.name} never sees or stores your password.</p>
            </div>
          </div>

          {/* Registration Link */}
          <div className="text-center space-y-4">
            <Separator />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have an organization account yet?
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/register')}
                className="w-full"
                disabled={isCheckingApi || !isApiAvailable}
                tabIndex={isCheckingApi || !isApiAvailable ? -1 : 0}
              >
                Register Your Organization
                <ExternalLink size={16} className="ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Set up {appConfig.name} for your organization in minutes
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}