import { useApiStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';
import { notifications } from '@/lib/utils/notifications';
import { useCallback } from 'react';

export function useApiAvailability() {
  const { 
    isApiAvailable, 
    isCheckingApi,
    setApiAvailable, 
    setCheckingApi 
  } = useApiStore();

  const checkApiAvailability = useCallback(async () => {
    setCheckingApi(true);
    try {
      await apiService.getHealth();
      setApiAvailable(true);
      return true;
    } catch (error) {
      console.error('API availability check failed:', error instanceof Error ? error.message : String(error));
      setApiAvailable(false);
      notifications.showError('API service is currently unavailable. Please check your connection and try again.');
      return false;
    } finally {
      setCheckingApi(false);
    }
  }, [setApiAvailable, setCheckingApi]);

  const getApiStatus = useCallback(() => {
    if (isCheckingApi) {
      return {
        loadingText: 'Checking service status...',
        statusMessage: 'Verifying connection to service...',
        isChecking: true,
        isUnavailable: false,
      };
    }
    if (!isApiAvailable) {
      return {
        loadingText: 'Service unavailable',
        statusMessage: 'Unable to connect to the service. Please check your connection and try again later.',
        isChecking: false,
        isUnavailable: true,
      };
    }
    return {
      loadingText: '',
      statusMessage: '',
      isChecking: false,
      isUnavailable: false,
    };
  }, [isCheckingApi, isApiAvailable]);

  return {
    isApiAvailable,
    isCheckingApi,
    checkApiAvailability,
    isFormDisabled: isCheckingApi || !isApiAvailable,
    getApiStatus,
  };
}
