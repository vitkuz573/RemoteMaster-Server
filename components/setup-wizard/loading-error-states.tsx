'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoadingErrorStatesProps {
  isCheckingApi: boolean;
  isApiAvailable: boolean;
  getApiStatus: () => { loadingText: string; statusMessage: string };
}

export function LoadingErrorStates({
  isCheckingApi,
  isApiAvailable,
  getApiStatus,
}: LoadingErrorStatesProps) {
  const router = useRouter();
  const { loadingText, statusMessage } = getApiStatus();
  // Show loading state while checking API
  if (isCheckingApi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Show error state if API unavailable
  if (!isApiAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Service Unavailable</CardTitle>
            <CardDescription>
              {statusMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.refresh()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 