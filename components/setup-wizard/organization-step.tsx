'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';
import { OrganizationForm } from './types';

interface OrganizationStepProps {
  form: OrganizationForm;
  onFormChange: (field: keyof OrganizationForm, value: string | number) => void;
  industries: string[];
  companySizes: string[];
  isLoadingData: boolean;
  isFormDisabled: boolean;
}

export function OrganizationStep({
  form,
  onFormChange,
  industries,
  companySizes,
  isLoadingData,
  isFormDisabled
}: OrganizationStepProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Organization Name *
          </Label>
          <div className="relative">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="Acme Corporation"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
            {form.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="domain" className="text-sm font-medium text-foreground">
            Domain *
          </Label>
          <div className="relative">
            <Input
              id="domain"
              value={form.domain}
              onChange={(e) => onFormChange('domain', e.target.value)}
              placeholder="acme.com"
              disabled={isFormDisabled}
              className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm"
            />
            {form.domain && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="industry" className="text-sm font-medium text-foreground">
            Industry *
          </Label>
          <Select value={form.industry} onValueChange={(value) => onFormChange('industry', value)} disabled={isFormDisabled}>
            <SelectTrigger className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
              {isLoadingData ? (
                <SelectItem value="loading" disabled className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading industries...
                  </div>
                </SelectItem>
              ) : (
                industries.map((industry) => (
                  <SelectItem key={industry} value={industry} className="hover:bg-primary/10">
                    {industry}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="size" className="text-sm font-medium text-foreground">
            Company Size *
          </Label>
          <Select value={form.size} onValueChange={(value) => onFormChange('size', value)} disabled={isFormDisabled}>
            <SelectTrigger className="h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
              {isLoadingData ? (
                <SelectItem value="loading" disabled className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading company sizes...
                  </div>
                </SelectItem>
              ) : (
                companySizes.map((size) => (
                  <SelectItem key={size} value={size} className="hover:bg-primary/10">
                    {size}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Organization Description
        </Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Brief description of your organization..."
          rows={4}
          disabled={isFormDisabled}
          className="min-h-[120px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  );
} 