'use client';

import React from 'react';
import { useAuth, type UseAuthOptions } from '@/hooks/use-auth';

type AuthGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  options?: UseAuthOptions;
};

export function AuthGate({ children, fallback = null, options }: AuthGateProps) {
  const auth = useAuth(options);

  if (auth.isCheckingAuth) return fallback;
  if (!auth.isAuthenticated) return fallback;

  return <>{children}</>;
}

