import { useApiContext } from '@/contexts/api-context';
import { API_CONFIG } from '@/lib/api-config';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/hooks/use-notifications';
import { useCallback, useEffect } from 'react';
import React from 'react';

export function useApiAvailability() {
  const { state, setApiAvailable, setCheckingApi } = useApiContext();
  const { showError, showInfo } = useNotifications();
  
  // Track if we've already initialized
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Use the single API service - MSW will handle mocking if enabled
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
    
    // Check API availability (MSW will handle mocking if enabled)
    checkApiAvailability();
  }, [checkApiAvailability, setApiAvailable, hasInitialized]);

  // Helper function to determine if forms should be disabled
  const isFormDisabled = state.isCheckingApi || !state.isApiAvailable;

  // Helper function to get loading text
  const getLoadingText = () => {
    if (state.isCheckingApi) return 'Checking service status...';
    if (!state.isApiAvailable) return 'Service unavailable';
    return '';
  };

  // Helper function to get status message
  const getStatusMessage = () => {
    if (state.isCheckingApi) {
      return 'Verifying connection to service...';
    }
    if (!state.isApiAvailable) {
      return 'Unable to connect to the service. Please check your connection and try again later.';
    }
    return '';
  };

  return {
    // State
    isApiAvailable: state.isApiAvailable,
    isCheckingApi: state.isCheckingApi,
    isMockApi: state.isMockApi,
    
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