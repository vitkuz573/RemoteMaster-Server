import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const useNotifications = () => {
  const showError = useCallback((error: ApiError | string, options?: object) => {
    const message = typeof error === 'string' ? error : error.message;
    
    toast.error(message, {
      duration: 5000,
      ...options,
    });
  }, []);

  const showSuccess = useCallback((message: string, options?: object) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  }, []);

  const showWarning = useCallback((message: string, options?: object) => {
    toast.warning(message, {
      duration: 4000,
      ...options,
    });
  }, []);

  const showInfo = useCallback((message: string, options?: object) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  }, []);

  const showLoading = useCallback((message: string, options?: object) => {
    return toast.loading(message, options);
  }, []);

  const dismiss = useCallback((toastId: string | number) => {
    toast.dismiss(toastId);
  }, []);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
  };
}; 