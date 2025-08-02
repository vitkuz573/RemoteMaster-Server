import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const useNotifications = () => {
  const showError = (error: ApiError | string) => {
    const message = typeof error === 'string' ? error : error.message;
    
    toast.error(message, {
      duration: 5000,
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showWarning = (message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  };

  const showInfo = (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
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