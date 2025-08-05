'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { 
  Building2, 
  ArrowRight, 
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  User
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { useHeader } from '@/contexts/header-context';
import { useAuth } from '@/hooks/use-auth';
import { apiService } from '@/lib/api-service';

export default function LoginPage() {
  const router = useRouter();
  const { showHeader, resetConfig, updateConfig } = useHeader();
  const [loginMode, setLoginMode] = React.useState<'sso' | 'credentials'>('sso');
  const [organizationId, setOrganizationId] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNavigatingToSetup, setIsNavigatingToSetup] = React.useState(false);
  const [error, setError] = React.useState("");

  // Auth store
  const auth = useAuth();
  const [isApiAvailable, setIsApiAvailable] = React.useState(true);
  const [isCheckingApi, setIsCheckingApi] = React.useState(true);

  // Application configuration (imported from centralized config)

  // Show header on login page and reset header config
  React.useEffect(() => {
    showHeader();
    resetConfig();
    updateConfig({ showNotifications: false, showProfile: false });
  }, [showHeader, resetConfig, updateConfig]);

  // Load organizations from external API
  React.useEffect(() => {
    const loadOrganizations = async () => {
      setIsCheckingApi(true);
      try {
        // Use the appropriate API service based on configuration
        const api = apiService;
        const data = await api.getOrganizations();
        const organizations = data.organizations || [];
        const tenants = organizations.map((org: any) => ({
          id: org.id,
          name: org.name,
          domain: org.domain,
          idp: org.idpConfig?.provider || 'Internal',
          byoidConfig: org.byoidConfig || null
        }));
  
        setKnownTenants(tenants);
        setIsApiAvailable(true);
      } catch (err) {
  
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
      // SSO login
      if (!domain.trim()) {
        setError("Please enter your organization ID");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // First check if organization exists
        const trimmedDomain = domain.trim();
        const tenant = knownTenants.find(t => 
          t.id === trimmedDomain || 
          t.domain === trimmedDomain || 
          t.id.toLowerCase() === trimmedDomain.toLowerCase() ||
          t.domain.toLowerCase() === trimmedDomain.toLowerCase()
        );
        
        if (!tenant) {
          setError("Organization not found. Please check your organization ID or contact your administrator.");
          setIsLoading(false);
          return;
        }

        if (tenant.byoidConfig && tenant.byoidConfig.status === 'active') {
          // Discover the tenant's Identity Provider using OpenID Connect discovery.
          // In development, this request will be intercepted by MSW.
          await apiService.discoverOpenIDProvider(tenant.byoidConfig.issuerUrl);

          // Simulate redirect delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Redirect to main dashboard after successful discovery
          router.push("/");
        } else {
          // No BYOID configuration, redirect to main app
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
      if (!email.trim() || !password.trim() || !domain.trim()) {
        setError("Please fill in all fields");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // First check if organization exists
        const trimmedDomain = domain.trim();
        const tenant = knownTenants.find(t => 
          t.id === trimmedDomain || 
          t.domain === trimmedDomain || 
          t.id.toLowerCase() === trimmedDomain.toLowerCase() ||
          t.domain.toLowerCase() === trimmedDomain.toLowerCase()
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
          domain: domain.trim()
        });

        // Persist auth in zustand store (with localStorage fallback handled by middleware)
        auth.login(result.token, {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          avatar: null,
          organizationId: result.user.organization.id,
          organizationDomain: result.user.organization.domain,
          organizationName: result.user.organization.name,
        });

        // Optionally keep raw response in localStorage for debugging
        if (typeof window !== "undefined") {
          localStorage.setItem("tenant", domain.trim());
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
          <ModeToggle
            modes={[
              { id: 'sso', label: 'SSO Login', icon: <Shield size={16} /> },
              { id: 'credentials', label: 'Credentials', icon: <User size={16} /> }
            ]}
            value={loginMode}
            onValueChange={(value) => {
              setLoginMode(value as 'sso' | 'credentials');
              // Clear error when switching modes
              setError("");
            }}
            disabled={isCheckingApi || !isApiAvailable}
          />

          {/* Loading State */}
          {isCheckingApi && (
            <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <LoadingSpinner size="sm" />
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
                    value={loginMode === 'sso' ? organizationId : domain}
                    onChange={(e) => {
                      if (loginMode === 'sso') {
                        setOrganizationId(e.target.value);
                      } else {
                        setDomain(e.target.value);
                      }
                    }}
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
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">
                        {loginMode === 'sso' ? 'Connecting...' : 'Signing in...'}
                      </span>
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
                onClick={() => {
                  setIsNavigatingToSetup(true);
                  // Use replace to avoid back button issues
                  router.replace('/setup');
                }}
                className="w-full"
                disabled={isNavigatingToSetup || isCheckingApi || !isApiAvailable}
                tabIndex={isNavigatingToSetup || isCheckingApi || !isApiAvailable ? -1 : 0}
              >
                {isNavigatingToSetup ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  <>
                    Register Your Organization
                    <ExternalLink size={16} className="ml-2" />
                  </>
                )}
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