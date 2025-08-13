"use client";

import { useEffect } from 'react';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export function ErrorReporter() {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED) return;
    const onError = (event: ErrorEvent) => {
      logger.error('window.error', event.error || new Error(event.message), {
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('unhandledrejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
