import { toast } from 'sonner';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const showError = (error: ApiError | string, options?: object) => {
  const message = typeof error === 'string' ? error : error.message;

  toast.error(message, {
    duration: 5000,
    ...options,
  });
};

export const showSuccess = (message: string, options?: object) => {
  toast.success(message, {
    duration: 3000,
    ...options,
  });
};

export const showWarning = (message: string, options?: object) => {
  toast.warning(message, {
    duration: 4000,
    ...options,
  });
};

export const showInfo = (message: string, options?: object) => {
  toast.info(message, {
    duration: 3000,
    ...options,
  });
};

export const showLoading = (message: string, options?: object) => {
  return toast.loading(message, options);
};

export const dismiss = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const notifications = {
  showError,
  showSuccess,
  showWarning,
  showInfo,
  showLoading,
  dismiss,
};
