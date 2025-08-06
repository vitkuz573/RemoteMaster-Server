import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const useNotifications = () => {
  const showError = (error: ApiError | string, options?: object) => {
    const message = typeof error === 'string' ? error : error.message;
    
    toast.error(message, {
      duration: 5000,
      ...options,
    });
  };

  const showSuccess = (message: string, options?: object) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const showWarning = (message: string, options?: object) => {
    toast.warning(message, {
      duration: 4000,
      ...options,
    });
  };

  const showInfo = (message: string, options?: object) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  };

  const showLoading = (message: string, options?: object) => {
    return toast.loading(message, options);
  };

  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
  };
}; 