'use client';

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FieldErrorProps {
  message: string | undefined;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle className="w-3 h-3" />
      <span>{message}</span>
    </div>
  );
}

interface FieldSuccessProps {
  show: boolean;
}

export function FieldSuccess({ show }: FieldSuccessProps) {
  if (!show) return null;
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <CheckCircle className="w-5 h-5 text-green-500" />
    </div>
  );
}
