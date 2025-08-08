'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { OrganizationForm } from './types';
import { organizationSchema } from './validation-schemas';
import { FieldError, FieldSuccess } from './form-helpers';

interface OrganizationStepProps {
  form: OrganizationForm;
  onFormChange: (field: keyof OrganizationForm, value: string | number) => void;
  industries: string[];
  companySizes: string[];
}

export function OrganizationStep({
  form,
  onFormChange,
  industries,
  companySizes,
}: OrganizationStepProps) {
  const {
    register,
    formState: { errors, touchedFields },
    setValue
  } = useForm({
    resolver: zodResolver(organizationSchema),
    mode: 'onChange',
    defaultValues: {
      name: form.name,
      domain: form.domain,
      industry: form.industry,
      size: form.size,
      description: form.description
    }
  });



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
              onChange={(e) => {
                setValue('name', e.target.value, { shouldValidate: true });
                onFormChange('name', e.target.value);
              }}
              placeholder="Acme Corporation"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <FieldSuccess show={!!touchedFields.name && !errors.name} />
          </div>
          <FieldError message={errors.name?.message} />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="domain" className="text-sm font-medium text-foreground">
            Domain *
          </Label>
          <div className="relative">
            <Input
              id="domain"
              {...register('domain')}
              onChange={(e) => {
                setValue('domain', e.target.value, { shouldValidate: true });
                onFormChange('domain', e.target.value);
              }}
              placeholder="acme.com"
              
              className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
                errors.domain ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <FieldSuccess show={!!touchedFields.domain && !errors.domain} />
          </div>
          <FieldError message={errors.domain?.message} />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="industry" className="text-sm font-medium text-foreground">
            Industry *
          </Label>
          <Select 
            defaultValue={form.industry}
            onValueChange={(value) => {
              setValue('industry', value, { shouldValidate: true });
              onFormChange('industry', value);
            }}
          >
            <SelectTrigger className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
              errors.industry ? 'border-red-500 focus:border-red-500' : ''
            }`}>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry} className="hover:bg-primary/10">
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.industry?.message} />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="size" className="text-sm font-medium text-foreground">
            Company Size *
          </Label>
          <Select 
            defaultValue={form.size}
            onValueChange={(value) => {
              setValue('size', value, { shouldValidate: true });
              onFormChange('size', value);
            }}
          >
            <SelectTrigger className={`h-12 px-4 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm ${
              errors.size ? 'border-red-500 focus:border-red-500' : ''
            }`}>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-primary/20">
              {companySizes.map((size) => (
                <SelectItem key={size} value={size} className="hover:bg-primary/10">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.size?.message} />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Organization Description
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          onChange={(e) => {
            setValue('description', e.target.value, { shouldValidate: true });
            onFormChange('description', e.target.value);
          }}
          placeholder="Brief description of your organization..."
          rows={4}
          
          className={`min-h-[120px] px-4 py-3 text-base transition-all duration-200 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50 backdrop-blur-sm resize-none ${
            errors.description ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        <FieldError message={errors.description?.message} />
      </div>
    </div>
  );
} 