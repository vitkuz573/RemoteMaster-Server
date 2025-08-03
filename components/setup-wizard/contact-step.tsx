'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { OrganizationForm } from './types';

interface ContactStepProps {
  form: OrganizationForm;
  onFormChange: (field: keyof OrganizationForm, value: string | number) => void;
  isFormDisabled: boolean;
}

export function ContactStep({
  form,
  onFormChange,
  isFormDisabled
}: ContactStepProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="contactName" className="text-sm font-medium text-foreground">
            Contact Name *
          </Label>
          <div className="relative">
            <Input
              id="contactName"
              value={form.contactName}
              onChange={(e) => onFormChange('contactName', e.target.value)}
              placeholder="John Doe"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
            {form.contactName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
            Contact Email *
          </Label>
          <div className="relative">
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => onFormChange('contactEmail', e.target.value)}
              placeholder="john@acme.com"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
            {form.contactEmail && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
            Contact Phone *
          </Label>
          <div className="relative">
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => onFormChange('contactPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
            {form.contactPhone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="expectedUsers" className="text-sm font-medium text-foreground">
            Organization Size (Employees)
          </Label>
          <div className="relative">
            <Input
              id="expectedUsers"
              type="number"
              min="1"
              max="10000"
              value={form.expectedUsers}
              onChange={(e) => onFormChange('expectedUsers', parseInt(e.target.value) || 10)}
              placeholder="10"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="address" className="text-sm font-medium text-foreground">
          Address *
        </Label>
        <Textarea
          id="address"
          value={form.address}
          onChange={(e) => onFormChange('address', e.target.value)}
          placeholder="123 Business St, City, State, ZIP"
          rows={3}
          disabled={isFormDisabled}
          className="min-h-[100px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  );
} 