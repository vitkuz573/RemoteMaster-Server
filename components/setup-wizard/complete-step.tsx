'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Plus, 
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  Shield
} from 'lucide-react';
import { OrganizationForm } from './types';
import { toast } from 'sonner';

interface CompleteStepProps {
  orgForm: OrganizationForm;
  onStartNew?: () => void;
}

export function CompleteStep({ orgForm, onStartNew }: CompleteStepProps) {
  const handleDownloadInfo = () => {
    const data = {
      organization: {
        name: orgForm.name,
        domain: orgForm.domain,
        industry: orgForm.industry,
        size: orgForm.size,
        description: orgForm.description,
        contactName: orgForm.contactName,
        contactEmail: orgForm.contactEmail,
        contactPhone: orgForm.contactPhone,
        address: orgForm.address,
        expectedUsers: orgForm.expectedUsers,
        selectedPlan: orgForm.selectedPlan
      },
      registrationDate: new Date().toISOString(),
      note: 'Please save this information as it will not be available again.'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgForm.name}-setup-info.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Organization information downloaded successfully!');
  };

  const handleStartNew = () => {
    if (onStartNew) {
      onStartNew();
    } else {
      // Fallback: reload the page to start fresh
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-green-800 dark:text-green-200">
                Setup Complete!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your organization has been successfully configured and is ready to use.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Important Warning */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
                Important: Save Your Information
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                This setup information will not be available again. Please download and save it securely.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDownloadInfo}
            variant="outline" 
            className="w-full sm:w-auto border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Setup Information
          </Button>
        </CardContent>
      </Card>

      {/* Organization Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Summary</CardTitle>
          <CardDescription>Your configured organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{orgForm.name}</p>
                <p className="text-sm text-muted-foreground">{orgForm.domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{orgForm.contactName}</p>
                <p className="text-sm text-muted-foreground">{orgForm.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Plan: {orgForm.selectedPlan}</p>
                <p className="text-sm text-muted-foreground">{orgForm.expectedUsers} users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Industry</p>
                <p className="text-sm text-muted-foreground">{orgForm.industry} • {orgForm.size}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
          <CardDescription>Choose your next action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={handleStartNew}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Register Another Organization</p>
                <p className="text-sm text-muted-foreground">Start a new setup process</p>
              </div>
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              <div className="text-center">
                <p className="font-medium">Go to Dashboard</p>
                <p className="text-sm text-muted-foreground">Access your organization</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 