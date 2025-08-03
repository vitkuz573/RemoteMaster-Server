'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { OrganizationForm } from './types';
import { contactSchema } from './validation-schemas';

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
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      address: form.address,
      expectedUsers: form.expectedUsers
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
    
    if (value && !error) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      );
    }
    return null;
  };

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
              {...register('contactName')}
              placeholder="John Doe"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactName ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {renderFieldSuccess('contactName')}
          </div>
          {renderFieldError('contactName')}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
            Contact Email *
          </Label>
          <div className="relative">
            <Input
              id="contactEmail"
              type="email"
              {...register('contactEmail')}
              placeholder="john@acme.com"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactEmail ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {renderFieldSuccess('contactEmail')}
          </div>
          {renderFieldError('contactEmail')}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
            Contact Phone *
          </Label>
          <div className="relative">
            <Input
              id="contactPhone"
              {...register('contactPhone')}
              placeholder="+1 (555) 123-4567"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactPhone ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {renderFieldSuccess('contactPhone')}
          </div>
          {renderFieldError('contactPhone')}
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
              {...register('expectedUsers', { valueAsNumber: true })}
              placeholder="10"
              disabled={isFormDisabled}
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.expectedUsers ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
          </div>
          {renderFieldError('expectedUsers')}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="address" className="text-sm font-medium text-foreground">
          Address *
        </Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="123 Business St, City, State, ZIP"
          rows={3}
          disabled={isFormDisabled}
          className={`min-h-[100px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none ${
            errors.address ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        {renderFieldError('address')}
      </div>
    </div>
  );
} 