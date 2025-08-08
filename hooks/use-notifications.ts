"use client";

import { useCallback } from 'react';
import { toast, type ExternalToast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

type ToastOptions = ExternalToast | undefined;

const DEFAULTS = Object.freeze({
  success: 3000,
  info: 3000,
  warning: 4000,
  error: 5000,
});

export const useNotifications = () => {
  const showError = useCallback((error: ApiError | string, options?: ToastOptions) => {
    const message = typeof error === 'string' ? error : error?.message || 'Unexpected error';
    toast.error(message, { duration: DEFAULTS.error, ...options });
  }, []);

  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, { duration: DEFAULTS.success, ...options });
  }, []);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    toast.warning(message, { duration: DEFAULTS.warning, ...options });
  }, []);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    toast.info(message, { duration: DEFAULTS.info, ...options });
  }, []);

  const showLoading = useCallback((message: string, options?: ExternalToast) => {
    return toast.loading(message, options);
  }, []);

  const dismiss = useCallback((toastId: string | number) => {
    toast.dismiss(toastId);
  }, []);

  const showApiError = useCallback((err: unknown, fallback = 'API request failed') => {
    if (typeof err === 'string') return showError(err);
    if (err && typeof err === 'object' && 'message' in err) {
      // Narrow to any with message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const status = e?.status ?? e?.response?.status;
      const message = e?.message ?? e?.response?.data?.message ?? fallback;
      return showError({ message, status });
    }
    return showError(fallback);
  }, [showError]);

  const asPromise = useCallback(<T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string; }) => {
    return toast.promise(promise, messages);
  }, []);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
    showApiError,
    asPromise,
  } as const;
};
