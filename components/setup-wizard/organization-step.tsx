'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { OrganizationForm } from './types';
import { organizationSchema } from './validation-schemas';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: form.name,
      domain: form.domain,
      industry: form.industry === 'loading' ? '' : form.industry,
      size: form.size === 'loading' ? '' : form.size,
      description: form.description
    }
  });

  const watchedValues = watch();

  // Update parent form when values change
  React.useEffect(() => {
    Object.entries(watchedValues).forEach(([key, value]) => {
      if (value !== undefined && value !== form[key as keyof OrganizationForm]) {
        onFormChange(key as keyof OrganizationForm, value);
      }
    });
  }, [watchedValues, onFormChange, form]);

  const renderFieldError = (fieldName: string) => {
    const error = errors[fieldName as keyof typeof errors];
    if (!error) return null;
    
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="w-3 h-3" />
        <span>{error.message as string}</span>
      </div>
    );
  };

  const renderFieldSuccess = (fieldName: string) => {
    const value = watchedValues[fieldName as keyof typeof watchedValues];
    const error = errors[fieldName as keyof typeof errors];
    
    // Don't show success if there's an error or no value
    if (error || !value || value.toString().trim() === '') {
      return null;
    }
    
    // Additional validation for specific fields
    if (fieldName === 'domain') {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(value.toString())) {
        return null;
      }
    }
    
    if (fieldName === 'name') {
      const nameRegex = /^[a-zA-Z0-9\s\-_&.()]{2,100}$/;
      if (!nameRegex.test(value.toString())) {
        return null;
      }
    }
    
    // Only show success if field is actually valid
    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <CheckCircle className="w-5 h-5 text-green-500" />
      </div>
    );
  };

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
              {...register('name')}
              placeholder="Acme Corporation"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {renderFieldSuccess('name')}
          </div>
          {renderFieldError('name')}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="domain" className="text-sm font-medium text-foreground">
            Domain *
          </Label>
          <div className="relative">
            <Input
              id="domain"
              {...register('domain')}
              placeholder="acme.com"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.domain ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {renderFieldSuccess('domain')}
          </div>
          {renderFieldError('domain')}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="industry" className="text-sm font-medium text-foreground">
            Industry *
          </Label>
          <Select 
            value={watchedValues.industry || ''} 
            onValueChange={(value) => setValue('industry', value)}
            disabled={isFormDisabled}
          >
            <SelectTrigger className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
              errors.industry ? 'border-red-500 focus:border-red-500' : ''
            }`}>
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
          {renderFieldError('industry')}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="size" className="text-sm font-medium text-foreground">
            Company Size *
          </Label>
          <Select 
            value={watchedValues.size || ''} 
            onValueChange={(value) => setValue('size', value)}
            disabled={isFormDisabled}
          >
            <SelectTrigger className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
              errors.size ? 'border-red-500 focus:border-red-500' : ''
            }`}>
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
          {renderFieldError('size')}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Organization Description
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of your organization..."
          rows={4}
          disabled={isFormDisabled}
          className={`min-h-[120px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none ${
            errors.description ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {renderFieldError('description')}
      </div>
    </div>
  );
} 