'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Shield } from 'lucide-react';
import { OrganizationForm } from './types';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PricingStepProps {
  form: OrganizationForm;
  onFormChange: (field: keyof OrganizationForm, value: string | number) => void;
  pricingPlans: PricingPlan[];
  isFormDisabled: boolean;
  totalMonthly: number;
}

export function PricingStep({
  form,
  onFormChange,
  pricingPlans,
  isFormDisabled,
  totalMonthly
}: PricingStepProps) {
  const selectedPlan = pricingPlans.find(plan => plan.id === form.selectedPlan) || pricingPlans[0];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select a pricing plan to determine the total monthly cost based on your expected number of users.
      </p>
      
      <div className="space-y-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 border rounded-lg transition-all duration-200 ${
              form.selectedPlan === plan.id
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={isFormDisabled ? undefined : () => onFormChange('selectedPlan', plan.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold">{plan.name}</h4>
                {plan.popular && (
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.price === 0 ? 'forever' : 'per user/month'}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  form.selectedPlan === plan.id
                    ? 'border-primary bg-primary'
                    : 'border-muted hover:border-primary/50'
                }`}>
                  {form.selectedPlan === plan.id && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="text-center">
        <div className="text-2xl font-bold">
          {selectedPlan?.price === 0 ? 'Free' : `$${totalMonthly}`}
        </div>
        <div className="text-xs text-muted-foreground">per month</div>
      </div>

      {form.selectedPlan === 'free' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Built-in Identity Provider</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Free plan includes our built-in identity provider. No additional configuration required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 