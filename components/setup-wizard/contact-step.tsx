'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OrganizationForm } from './types';
import { contactSchema } from './validation-schemas';
import { FieldError, FieldSuccess } from './form-helpers';

interface ContactStepProps {
  form: OrganizationForm;
  onFormChange: (field: keyof OrganizationForm, value: string | number) => void;
}

export function ContactStep({
  form,
  onFormChange,
}: ContactStepProps) {
  const {
    register,
    formState: { errors, touchedFields },
    setValue
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    defaultValues: {
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      address: form.address,
      expectedUsers: form.expectedUsers
    }
  });

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
              onChange={(e) => {
                setValue('contactName', e.target.value, { shouldValidate: true });
                onFormChange('contactName', e.target.value);
              }}
              placeholder="John Doe"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactName ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <FieldSuccess show={touchedFields.contactName && !errors.contactName} />
          </div>
          <FieldError message={errors.contactName?.message} />
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
              onChange={(e) => {
                setValue('contactEmail', e.target.value, { shouldValidate: true });
                onFormChange('contactEmail', e.target.value);
              }}
              placeholder="john@acme.com"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactEmail ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <FieldSuccess show={touchedFields.contactEmail && !errors.contactEmail} />
          </div>
          <FieldError message={errors.contactEmail?.message} />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
            Contact Phone *
          </Label>
          <div className="relative">
            <Input
              id="contactPhone"
              {...register('contactPhone')}
              onChange={(e) => {
                setValue('contactPhone', e.target.value, { shouldValidate: true });
                onFormChange('contactPhone', e.target.value);
              }}
              placeholder="+1 (555) 123-4567"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.contactPhone ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <FieldSuccess show={touchedFields.contactPhone && !errors.contactPhone} />
          </div>
          <FieldError message={errors.contactPhone?.message} />
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
              onChange={(e) => {
                setValue('expectedUsers', e.target.valueAsNumber, { shouldValidate: true });
                onFormChange('expectedUsers', e.target.valueAsNumber);
              }}
              placeholder="10"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.expectedUsers ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
          </div>
          <FieldError message={errors.expectedUsers?.message} />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="address" className="text-sm font-medium text-foreground">
          Address *
        </Label>
        <Textarea
          id="address"
          {...register('address')}
          onChange={(e) => {
            setValue('address', e.target.value, { shouldValidate: true });
            onFormChange('address', e.target.value);
          }}
          placeholder="123 Business St, City, State, ZIP"
          rows={3}
          
          className={`min-h-[100px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none ${
            errors.address ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        <FieldError message={errors.address?.message} />
      </div>
    </div>
  );
} 