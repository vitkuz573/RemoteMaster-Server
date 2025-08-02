"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/hooks/use-notifications';
import { CheckCircle, AlertCircle, Info, XCircle, Loader2 } from 'lucide-react';

export default function NotificationsDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess, showWarning, showInfo, showLoading, dismiss } = useNotifications();

  const handleTestSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleTestError = () => {
    showError('Something went wrong. Please try again.');
  };

  const handleTestWarning = () => {
    showWarning('This is a warning message.');
  };

  const handleTestInfo = () => {
    showInfo('Here is some useful information.');
  };

  const handleTestLoading = () => {
    setIsLoading(true);
    const toastId = showLoading('Processing your request...');
    
    setTimeout(() => {
      dismiss(toastId);
      showSuccess('Request completed!');
      setIsLoading(false);
    }, 3000);
  };

  const handleTestApiError = async () => {
    try {
      // This will trigger an API error notification
      await apiService.getOrganizations({ id: 'invalid-id' });
    } catch (error) {
      // Error notification is handled by apiService
    }
  };

  const handleTestApiSuccess = async () => {
    try {
      // This will show a success notification
      apiService.showSuccess('API operation completed successfully!');
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Notifications Demo</h1>
            <p className="text-lg text-muted-foreground">
              Test different types of notifications using shadcn sonner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Basic Notifications
                </CardTitle>
                <CardDescription>
                  Test different types of notification messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleTestSuccess}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Success
                  </Button>
                  
                  <Button 
                    onClick={handleTestError}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Error
                  </Button>
                  
                  <Button 
                    onClick={handleTestWarning}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Warning
                  </Button>
                  
                  <Button 
                    onClick={handleTestInfo}
                    variant="outline"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-500" />
                  Advanced Notifications
                </CardTitle>
                <CardDescription>
                  Test loading states and API notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleTestLoading}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Test Loading
                    </>
                  )}
                </Button>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleTestApiSuccess}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    API Success
                  </Button>
                  
                  <Button 
                    onClick={handleTestApiError}
                    variant="destructive"
                    className="w-full"
                  >
                    API Error
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Types Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>
                  Overview of available notification types and their usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Success
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Duration: 3 seconds
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for successful operations, confirmations, and positive feedback.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">
                        Error
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Duration: 5 seconds
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for errors, failures, and critical issues that need attention.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Warning
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Duration: 4 seconds
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for warnings, potential issues, and important notices.
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        Info
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Duration: 3 seconds
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Used for informational messages, tips, and general updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Examples */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                Code examples for implementing notifications in your components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
{`// Using the useNotifications hook
import { useNotifications } from '@/hooks/use-notifications';

const { showError, showSuccess, showWarning, showInfo } = useNotifications();

// Show different types of notifications
showSuccess('Operation completed!');
showError('Something went wrong');
showWarning('Please check your input');
showInfo('Here is some information');

// Using apiService directly
import { apiService } from '@/lib/api-service';

apiService.showSuccess('API call successful!');
apiService.showError('API call failed');
apiService.showWarning('API returned a warning');
apiService.showInfo('API information');`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 