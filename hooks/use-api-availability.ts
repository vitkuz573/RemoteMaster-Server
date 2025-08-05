import { useApiStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/hooks/use-notifications';
import { useCallback, useEffect } from 'react';
import React from 'react';

export function useApiAvailability() {
  const { 
    isApiAvailable, 
    isCheckingApi,
    setApiAvailable, 
    setCheckingApi 
  } = useApiStore();
  const { showError } = useNotifications();
  
  // Track if we've already initialized
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Use the single API service - MSW automatically handles mocking in development
  const api = apiService;

  // Check API availability
  const checkApiAvailability = useCallback(async () => {
    setCheckingApi(true);
    try {
      // Try to make a simple API call to check availability
      await api.getOrganizations();
      setApiAvailable(true);
      return true;
    } catch (error) {
      console.error('API availability check failed:', error);
      setApiAvailable(false);
      showError('API service is currently unavailable. Please check your connection and try again.');
      return false;
    } finally {
      setCheckingApi(false);
    }
  }, [api, setApiAvailable, setCheckingApi, showError]);

  // Check API availability on mount
  useEffect(() => {
    if (hasInitialized) {
      return;
    }
    
    setHasInitialized(true);
    
    // Check API availability (MSW automatically handles mocking in development)
    checkApiAvailability();
  }, [checkApiAvailability, setApiAvailable, hasInitialized]);

  // Helper function to determine if forms should be disabled
  const isFormDisabled = isCheckingApi || !isApiAvailable;

  // Helper function to get loading text
  const getLoadingText = () => {
    if (isCheckingApi) return 'Checking service status...';
    if (!isApiAvailable) return 'Service unavailable';
    return '';
  };

  // Helper function to get status message
  const getStatusMessage = () => {
    if (isCheckingApi) {
      return 'Verifying connection to service...';
    }
    if (!isApiAvailable) {
      return 'Unable to connect to the service. Please check your connection and try again later.';
    }
    return '';
  };

  return {
    // State
    isApiAvailable,
    isCheckingApi,
    
    // Actions
    checkApiAvailability,
    
    // Form helpers
    isFormDisabled,
    getLoadingText,
    getStatusMessage,
    
    // API service
    api,
  };
} 