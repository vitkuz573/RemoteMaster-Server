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

export default function TenantLoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = React.useState<'sso' | 'credentials'>('sso');
  const [tenantId, setTenantId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Application configuration (imported from centralized config)

  // Load organizations from API
  React.useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          const organizations = data.organizations || [];
          const tenants = organizations.map((org: any) => ({
            id: org.id,
            name: org.name,
            domain: org.domain,
            idp: org.idpConfig?.provider || 'Internal'
          }));
          console.log('Loaded organizations:', tenants);
          setKnownTenants(tenants);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    };

    loadOrganizations();
  }, []);

  // Tenant registry will be fetched from API
  const [knownTenants, setKnownTenants] = React.useState<Array<{id: string, name: string, domain: string, idp: string}>>([]);

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

        // In a real app, this would redirect to the actual IdP
        // For demo purposes, we'll redirect to the main app
        console.log(`Redirecting to ${tenant.idp} for tenant: ${tenant.name}`);
        
        // Simulate SSO redirect delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to main dashboard
        router.push("/");
        
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

        // Call the login API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            domain: tenantId.trim()
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Login failed');
        }

        // Save auth data to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("tenant", tenantId.trim());
        }

        // Show success message
        alert(result.message || 'Login successful!');
        
        // Redirect to main dashboard
        router.push("/");
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        setIsLoading(false);
      }
    }
  };



  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/30">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                loginMode === 'sso'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              SSO Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                loginMode === 'credentials'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Credentials
            </button>
          </div>

          {/* Main Form */}
          <Card className="border-2">
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
                    autoFocus
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {loginMode === 'sso' ? 'Connecting...' : 'Signing in...'}
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
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your credentials are handled by your organization's identity provider. 
              {appConfig.name} never sees or stores your password.
            </p>
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