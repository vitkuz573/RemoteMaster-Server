"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useApiStore } from '@/lib/stores';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/hooks/use-notifications';

export interface ApiAvailabilityOptions {
  autoCheck?: boolean;
  notifyOnError?: boolean;
  pollIntervalMs?: number | null; // null disables polling
}

export function useApiAvailability(options: ApiAvailabilityOptions = {}) {
  const { autoCheck = true, notifyOnError = false, pollIntervalMs = null } = options;
  const { isApiAvailable, isCheckingApi, setApiAvailable, setCheckingApi } = useApiStore();
  const { showError } = useNotifications();

  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const checkApiAvailability = useCallback(async () => {
    if (inFlight.current) {
      // Avoid duplicate concurrent checks
      return false;
    }
    setCheckingApi(true);
    setError(null);
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      await apiService.getHealth({ signal: controller.signal });
      setApiAvailable(true);
      setLastCheckedAt(new Date());
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('API availability check failed:', message);
      setApiAvailable(false);
      setError(message);
      if (notifyOnError) {
        showError('API service is currently unavailable. Please check your connection and try again.');
      }
      return false;
    } finally {
      setCheckingApi(false);
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, [notifyOnError, setApiAvailable, setCheckingApi, showError]);

  // Initial check
  useEffect(() => {
    if (autoCheck) {
      void checkApiAvailability();
    }
  }, [autoCheck, checkApiAvailability]);

  // Optional polling
  useEffect(() => {
    if (!pollIntervalMs) return;
    const id = setInterval(() => void checkApiAvailability(), pollIntervalMs);
    return () => clearInterval(id);
  }, [pollIntervalMs, checkApiAvailability]);

  const isFormDisabled = isCheckingApi || !isApiAvailable;

  const apiStatus = useMemo(() => {
    if (isCheckingApi) {
      return {
        loadingText: 'Checking service status...',
        statusMessage: 'Verifying connection to service...',
      } as const;
    }
    if (!isApiAvailable) {
      return {
        loadingText: 'Service unavailable',
        statusMessage: 'Unable to connect to the service. Please check your connection and try again later.',
      } as const;
    }
    return { loadingText: '', statusMessage: '' } as const;
  }, [isCheckingApi, isApiAvailable]);


  const ensureAvailable = useCallback(async () => {
    if (isApiAvailable) return true;
    return checkApiAvailability();
  }, [isApiAvailable, checkApiAvailability]);

  return {
    isApiAvailable,
    isCheckingApi,
    checkApiAvailability,
    ensureAvailable,
    isFormDisabled,
    apiStatus,
    lastCheckedAt,
    error,
  } as const;
}
