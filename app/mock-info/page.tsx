'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Code,
  Database,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/contexts/header-context';
import { API_CONFIG } from '@/lib/api-config';

export default function MockInfoPage() {
  const router = useRouter();
  const { showHeader } = useHeader();

  React.useEffect(() => {
    showHeader();
  }, [showHeader]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <Info className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Mock API Testing Mode</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This application is currently running with mock API for testing purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock API Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Mock API Status
              </CardTitle>
              <CardDescription>
                Current API configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Mode:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mock API Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications:</span>
                <Badge variant="outline">Enabled</Badge>
              </div>

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
            </CardContent>
          </Card>

          {/* Test Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Test Credentials
              </CardTitle>
              <CardDescription>
                Use these credentials to test the login functionality
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
            </CardContent>
          </Card>

          {/* Features Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Features to Test
              </CardTitle>
              <CardDescription>
                Available functionality for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Organization Registration Wizard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">User Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">BYOID Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Admin Panel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">System Health Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Toast Notifications</span>
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
                onClick={() => router.push('/setup')} 
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
            </CardContent>
          </Card>
        </div>

        {/* Warning */}
        <Card className="mt-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              Important Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              This is a mock API for testing purposes. All data is simulated and will not persist. 
              To switch to real API, change <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">USE_MOCK_API: true</code> to <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">false</code> in <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">lib/api-config.ts</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 