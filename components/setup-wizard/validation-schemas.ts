import { z } from 'zod';

// Organization step validation schema
export const organizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_&.()]+$/, 'Organization name contains invalid characters'),
  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Please enter a valid domain (e.g., example.com)'),
  industry: z.string().min(1, 'Industry is required'),
  size: z.string().min(1, 'Company size is required'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default('')
});

// Contact step validation schema
export const contactSchema = z.object({
  contactName: z.string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Contact name contains invalid characters'),
  contactEmail: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  contactPhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
  expectedUsers: z.number()
    .min(1, 'Expected users must be at least 1')
    .max(10000, 'Expected users cannot exceed 10,000')
});

// Combined organization form schema
export const organizationFormSchema = organizationSchema.merge(contactSchema).extend({
  selectedPlan: z.string().min(1, 'Please select a pricing plan')
});

// BYOID step validation schema
export const byoidSchema = z.object({
  issuerUrl: z.string()
    .url('Please enter a valid URL')
    .refine((url) => url.startsWith('https://'), 'Issuer URL must use HTTPS'),
  clientId: z.string()
    .min(1, 'Client ID is required')
    .max(100, 'Client ID must be less than 100 characters'),
  clientSecret: z.string()
    .min(1, 'Client Secret is required')
    .max(200, 'Client Secret must be less than 200 characters')
});

// Types derived from schemas
export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
export type BYOIDFormData = z.infer<typeof byoidSchema>;
export type OrganizationStepData = z.infer<typeof organizationSchema>;
export type ContactStepData = z.infer<typeof contactSchema>; 