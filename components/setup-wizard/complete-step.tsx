'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, Info } from 'lucide-react';
import { OrganizationForm } from './types';

interface CompleteStepProps {
  orgForm: OrganizationForm;
}

export function CompleteStep({ orgForm }: CompleteStepProps) {
  const router = useRouter();

  return (
    <div className="text-center space-y-8">
      {/* Success Icon and Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-3xl font-bold mb-3">Setup Complete!</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your organization <strong>"{orgForm.name}"</strong> has been successfully configured and is ready to use.
          </p>
        </div>
      </div>

      {/* Login Credentials Card */}
      <Card className="max-w-2xl mx-auto border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Your Login Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-left">
              <span className="text-sm font-medium text-muted-foreground">Login URL</span>
              <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
                {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/login
              </div>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-muted-foreground">Admin Email</span>
              <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
                {orgForm.contactEmail}
              </div>
            </div>
          </div>
          
          <div className="text-left">
            <span className="text-sm font-medium text-muted-foreground">Organization ID (for SSO)</span>
            <div className="font-mono text-sm bg-background p-3 rounded border mt-1 break-all">
              {(() => {
                const registrationData = localStorage.getItem("organizationRegistration");
                if (registrationData) {
                  const data = JSON.parse(registrationData);
                  return data.id || 'Loading...';
                }
                return 'Loading...';
              })()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use this ID for SSO configuration and API integrations
            </p>
          </div>
         
          {(() => {
            const registrationData = localStorage.getItem("organizationRegistration");
            if (registrationData) {
              const data = JSON.parse(registrationData);
              if (data.credentials?.tempPassword) {
                return (
                  <div className="text-left">
                    <span className="text-sm font-medium text-muted-foreground">Temporary Password</span>
                    <div className="font-mono text-lg font-bold bg-background p-3 rounded border mt-1 text-green-600 text-center">
                      {data.credentials.tempPassword}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Use this password for your first login
                    </p>
                  </div>
                );
              }
            }
            return (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  <strong>Important:</strong> You will receive an email with your temporary password. 
                  Please change it after your first login.
                </p>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="text-left">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-3">What's Next?</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Check your email for login credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Sign in to your organization dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Invite team members to your organization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Configure additional security settings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button onClick={() => router.push('/login')} size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
          Sign In Now
        </Button>
        <Button variant="outline" onClick={() => router.push('/')} size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
} 