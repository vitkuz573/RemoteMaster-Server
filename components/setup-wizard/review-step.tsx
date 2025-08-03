'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Shield, 
  CheckCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users as UsersIcon,
  FileText
} from 'lucide-react';
import { OrganizationForm, BYOIDForm } from './types';

interface ReviewStepProps {
  orgForm: OrganizationForm;
  byoidForm: BYOIDForm;
  totalMonthly: number;
  pricingPlans: any[];
  industries: string[];
  companySizes: string[];
}

export function ReviewStep({ 
  orgForm, 
  byoidForm, 
  totalMonthly, 
  pricingPlans, 
  industries, 
  companySizes 
}: ReviewStepProps) {
  const selectedPlan = pricingPlans.find(plan => plan.id === orgForm.selectedPlan);
  const selectedIndustry = industries.find(ind => ind === orgForm.industry);
  const selectedSize = companySizes.find(size => size === orgForm.size);

  // Calculate the correct monthly cost based on plan
  const getMonthlyCost = () => {
    if (orgForm.selectedPlan === 'free') {
      return 0;
    }
    return totalMonthly;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
              <p className="text-base font-medium">{orgForm.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Domain</label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{orgForm.domain}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Industry</label>
              <p className="text-base font-medium">{selectedIndustry || orgForm.industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Size</label>
              <p className="text-base font-medium">{selectedSize || orgForm.size}</p>
            </div>
          </div>
          {orgForm.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base">{orgForm.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Primary contact details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{orgForm.contactName}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{orgForm.contactEmail}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{orgForm.contactPhone}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Users</label>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-muted-foreground" />
                <p className="text-base font-medium">{orgForm.expectedUsers} users</p>
              </div>
            </div>
          </div>
          {orgForm.address && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-base">{orgForm.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Pricing Plan</CardTitle>
              <CardDescription>Selected subscription plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{selectedPlan?.name || orgForm.selectedPlan}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlan?.description || 'Selected plan'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(getMonthlyCost())}
              </p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BYOID Configuration (if applicable) */}
      {orgForm.selectedPlan !== 'free' && byoidForm.issuerUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Identity Provider</CardTitle>
                <CardDescription>OpenID Connect configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Issuer URL</label>
                <p className="text-base font-medium break-all">{byoidForm.issuerUrl}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client ID</label>
                <p className="text-base font-medium">{byoidForm.clientId}</p>
              </div>
            </div>
            {byoidForm.discoveryData && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Provider Discovery Successful</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  OpenID Connect provider configuration has been validated
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Setup Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-medium">{orgForm.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">{selectedPlan?.name || orgForm.selectedPlan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Cost:</span>
              <span className="font-bold text-primary">{formatCurrency(getMonthlyCost())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Users:</span>
              <span className="font-medium">{orgForm.expectedUsers}</span>
            </div>
            {orgForm.selectedPlan !== 'free' && byoidForm.issuerUrl && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Identity Provider:</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 