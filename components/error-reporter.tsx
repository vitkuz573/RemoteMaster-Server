"use client";

import { useEffect } from 'react';
import { env } from '@/lib/env';

export function ErrorReporter() {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED) return;
    const onError = (event: ErrorEvent) => {
      try {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error',
            message: event.message,
            source: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'unhandledrejection',
            reason: String(event.reason),
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
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

