import { useApiStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/hooks/use-notifications';
import { useCallback, useEffect } from 'react';

export function useApiAvailability() {
  const { 
    isApiAvailable, 
    isCheckingApi,
    setApiAvailable, 
    setCheckingApi 
  } = useApiStore();
  const { showError } = useNotifications();

  const checkApiAvailability = useCallback(async () => {
    setCheckingApi(true);
    try {
      await apiService.getOrganizations();
      setApiAvailable(true);
      return true;
    } catch (error) {
      console.error('API availability check failed:', error instanceof Error ? error.message : String(error));
      setApiAvailable(false);
      showError('API service is currently unavailable. Please check your connection and try again.');
      return false;
    } finally {
      setCheckingApi(false);
    }
  }, [setApiAvailable, setCheckingApi, showError]);

  useEffect(() => {
    checkApiAvailability();
  }, [checkApiAvailability]);

  // Helper function to determine if forms should be disabled
  const isFormDisabled = isCheckingApi || !isApiAvailable;

  const getApiStatus = useCallback(() => {
    if (isCheckingApi) {
      return {
        loadingText: 'Checking service status...',
        statusMessage: 'Verifying connection to service...',
      };
    }
    if (!isApiAvailable) {
      return {
        loadingText: 'Service unavailable',
        statusMessage: 'Unable to connect to the service. Please check your connection and try again later.',
      };
    }
    return {
      loadingText: '',
      statusMessage: '',
    };
  }, [isCheckingApi, isApiAvailable]);

  return {
    isApiAvailable,
    isCheckingApi,
    checkApiAvailability,
    isFormDisabled,
    getApiStatus,
  };
} 