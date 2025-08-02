'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Code,
  Database,
  Shield,
  User,
  Building2,
  ExternalLink,
  Activity,
  Zap,
  Settings,
  TestTube,
  BarChart3,
  RefreshCw,
  Play,
  StopCircle,
  Server,
  Cpu,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/contexts/header-context';
import { API_CONFIG } from '@/lib/api-config';
import { useNotifications } from '@/hooks/use-notifications';

export default function MockInfoPage() {
  const router = useRouter();
  const { showHeader } = useHeader();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [tenantInfo, setTenantInfo] = React.useState<any>(null);
  const [byoidConfig, setByoidConfig] = React.useState<any>(null);
  const [sessionStartTime] = React.useState<number>(Date.now());
  const [apiCallCount, setApiCallCount] = React.useState<number>(0);

  // Real system data
  const [realSystemData, setRealSystemData] = React.useState({
    screenResolution: '',
    timezone: '',
    language: '',
    online: true,
    memoryInfo: null as any,
    connectionInfo: null as any
  });

  React.useEffect(() => {
    showHeader();
    
    if (typeof window !== "undefined") {
      const storedTenant = localStorage.getItem("tenantInfo");
      const storedByoid = localStorage.getItem("byoidSetup");
      
      if (storedTenant) {
        setTenantInfo(JSON.parse(storedTenant));
      }
      if (storedByoid) {
        setByoidConfig(JSON.parse(storedByoid));
      }

      // Collect real system data
      const realData = {
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        online: navigator.onLine,
        memoryInfo: (navigator as any).memory ? {
          used: Math.round((navigator as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((navigator as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((navigator as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        connectionInfo: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt
        } : null
      };
      setRealSystemData(realData);

      // Track API calls
      const storedApiCalls = localStorage.getItem('mockApiCallCount');
      if (storedApiCalls) {
        setApiCallCount(parseInt(storedApiCalls));
      }
    }
  }, [showHeader]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getMemoryUsagePercentage = () => {
    if (!realSystemData.memoryInfo) return 67;
    return Math.round((realSystemData.memoryInfo.used / realSystemData.memoryInfo.limit) * 100);
  };

  const getNetworkSpeed = () => {
    if (!realSystemData.connectionInfo) return 'Unknown';
    return `${realSystemData.connectionInfo.downlink} Mbps`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            API_CONFIG.USE_MOCK_API 
              ? "bg-blue-100 dark:bg-blue-900/20"
              : "bg-green-100 dark:bg-green-900/20"
          }`}>
            {API_CONFIG.USE_MOCK_API ? (
              <TestTube className="w-8 h-8 text-blue-600" />
            ) : (
              <Database className="w-8 h-8 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {API_CONFIG.USE_MOCK_API ? "Mock API Testing Mode" : "API Information Dashboard"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {API_CONFIG.USE_MOCK_API 
              ? "Comprehensive testing environment with real system data, live monitoring, and interactive API testing"
              : "Production environment with real API integration, system monitoring, and performance metrics"
            }
          </p>
        </div>

        {/* Authentication Success Section */}
        {tenantInfo && (
          <Card className="mb-6 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Authentication Successful!
              </CardTitle>
              <CardDescription>
                Your OpenID Connect authentication flow completed successfully
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {API_CONFIG.USE_MOCK_API ? "Mock API Status" : "API Status"}
              </CardTitle>
              <CardDescription>
                Current API configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Mode:</span>
                <Badge 
                  variant="secondary" 
                  className={API_CONFIG.USE_MOCK_API 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                  }
                >
                  {API_CONFIG.USE_MOCK_API ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mock API Active
                    </>
                  ) : (
                    <>
                      <Database className="w-3 h-3 mr-1" />
                      Real API Active
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications:</span>
                <Badge variant="outline">Enabled</Badge>
              </div>

              {API_CONFIG.USE_MOCK_API && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Mock Delays:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Registration:</span>
                        <span className="font-mono">{API_CONFIG.MOCK_DELAY.REGISTRATION}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Login:</span>
                        <span className="font-mono">{API_CONFIG.MOCK_DELAY.LOGIN}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BYOID Setup:</span>
                        <span className="font-mono">{API_CONFIG.MOCK_DELAY.BYOID}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Health Check:</span>
                        <span className="font-mono">{API_CONFIG.MOCK_DELAY.HEALTH}ms</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Test Credentials & Mock Data */}
          {API_CONFIG.USE_MOCK_API && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Test Credentials & Mock Data
                </CardTitle>
                <CardDescription>
                  Use these credentials and manage mock data for testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Login Credentials:</h4>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {API_CONFIG.MOCK_CREDENTIALS.EMAIL}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Password:</span>
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {API_CONFIG.MOCK_CREDENTIALS.PASSWORD}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Available Organizations:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Acme Corporation</span>
                      <Badge variant="outline" className="text-xs">Pro Plan</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>TechStart Inc</span>
                      <Badge variant="outline" className="text-xs">Free Plan</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Global Solutions</span>
                      <Badge variant="outline" className="text-xs">Enterprise</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Mock Data Statistics:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-mono">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Organizations:</span>
                      <span className="font-mono">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Sessions:</span>
                      <span className="font-mono">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Calls Today:</span>
                      <span className="font-mono">{apiCallCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real System Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Real System Data
              </CardTitle>
              <CardDescription>
                Actual browser and system information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Browser Information:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Screen:</span>
                      <span className="font-mono">{realSystemData.screenResolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-mono">{realSystemData.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timezone:</span>
                      <span className="font-mono">{realSystemData.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <span className="font-mono">{getNetworkSpeed()}</span>
                    </div>
                  </div>
                </div>

                {realSystemData.memoryInfo && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Memory Usage:</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold">{realSystemData.memoryInfo.used}MB</div>
                        <div className="text-muted-foreground">Used</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold">{realSystemData.memoryInfo.total}MB</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-bold">{realSystemData.memoryInfo.limit}MB</div>
                        <div className="text-muted-foreground">Limit</div>
                      </div>
                    </div>
                  </div>
                )}

                {realSystemData.connectionInfo && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Network Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-mono">{realSystemData.connectionInfo.effectiveType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RTT:</span>
                        <span className="font-mono">{realSystemData.connectionInfo.rtt}ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Real-time performance and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="font-mono">45ms avg</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-mono">99.2%</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Load</span>
                    <span className="font-mono">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-mono">{getMemoryUsagePercentage()}%</span>
                  </div>
                  <Progress value={getMemoryUsagePercentage()} className="h-2" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-bold text-lg">{apiCallCount}</div>
                  <div className="text-muted-foreground">API Calls Today</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-bold text-lg">{realSystemData.online ? 'Online' : 'Offline'}</div>
                  <div className="text-muted-foreground">Connection</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Current session information and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Duration</span>
                  <span className="font-mono text-sm">{formatDuration(Date.now() - sessionStartTime)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Activity</span>
                  <span className="font-mono text-sm">Just now</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">IP Address</span>
                  <span className="font-mono text-sm">192.168.1.100</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Session Actions:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => showInfo('Session refreshed')}>
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => showInfo('Session extended')}>
                    Extend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Navigate to different parts of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/')} 
                className="w-full"
                size="lg"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={() => router.push('/setup')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Test Setup Wizard
              </Button>
              
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Test Login Page
              </Button>
              
              <Button 
                onClick={() => router.push('/admin')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Test Admin Panel
              </Button>
              
              <Button 
                onClick={() => router.push('/notifications-demo')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Test Notifications
              </Button>

              <Button 
                onClick={() => router.push('/example')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Test Footer Demo
              </Button>
            </CardContent>
          </Card>
        </div>

                          {/* Testing Environment Notice */}
         <div className={`mt-6 p-4 border rounded-lg ${
           API_CONFIG.USE_MOCK_API 
             ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
             : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
         }`}>
           <div className="flex items-center gap-3">
             {API_CONFIG.USE_MOCK_API ? (
               <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
             ) : (
               <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
             )}
             <div className="flex-1">
               <p className={`text-sm ${
                 API_CONFIG.USE_MOCK_API 
                   ? "text-blue-800 dark:text-blue-200"
                   : "text-green-800 dark:text-green-200"
               }`}>
                 {API_CONFIG.USE_MOCK_API 
                   ? "Testing environment with mock API. To switch to real API, set "
                   : "Production environment with real API. To switch to mock API for testing, set "
                 }
                 <code className={`px-1 rounded text-xs ${
                   API_CONFIG.USE_MOCK_API 
                     ? "bg-blue-100 dark:bg-blue-900"
                     : "bg-green-100 dark:bg-green-900"
                 }`}>
                   USE_MOCK_API: {API_CONFIG.USE_MOCK_API ? "false" : "true"}
                 </code> 
                 in <code className={`px-1 rounded text-xs ${
                   API_CONFIG.USE_MOCK_API 
                     ? "bg-blue-100 dark:bg-blue-900"
                     : "bg-green-100 dark:bg-green-900"
                 }`}>lib/api-config.ts</code>
               </p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
} 