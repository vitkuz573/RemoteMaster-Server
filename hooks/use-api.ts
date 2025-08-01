/**
 * React hooks for API operations
 * Provides easy-to-use hooks for data fetching and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ApiResponse } from '@/lib/api-client';

export interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook for GET requests
export function useApi<T>(
  endpoint: string,
  params?: Record<string, any>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<T>(endpoint, params);
      
      if (response.success && response.data) {
        setData(response.data);
        options.onSuccess?.(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
        options.onError?.(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, options.enabled, options.onSuccess, options.onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch with interval
  useEffect(() => {
    if (!options.refetchInterval || !options.enabled) return;

    const interval = setInterval(fetchData, options.refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, options.refetchInterval, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for mutations (POST, PUT, DELETE, PATCH)
export function useApiMutation<T = any, R = any>(
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const mutate = useCallback(async (
    endpoint: string,
    payload?: T,
    options?: {
      onSuccess?: (data: R) => void;
      onError?: (error: string) => void;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response: ApiResponse<R>;

      switch (method) {
        case 'POST':
          response = await apiClient.post<R>(endpoint, payload);
          break;
        case 'PUT':
          response = await apiClient.put<R>(endpoint, payload);
          break;
        case 'DELETE':
          response = await apiClient.delete<R>(endpoint);
          break;
        case 'PATCH':
          response = await apiClient.patch<R>(endpoint, payload);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success && response.data) {
        setData(response.data);
        options?.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Operation failed';
        setError(errorMessage);
        options?.onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [method]);

  return {
    mutate,
    loading,
    error,
    data,
  };
}

// Convenience hooks for specific HTTP methods
export const usePost = <T = any, R = any>() => useApiMutation<T, R>('POST');
export const usePut = <T = any, R = any>() => useApiMutation<T, R>('PUT');
export const useDelete = <T = any, R = any>() => useApiMutation<T, R>('DELETE');
export const usePatch = <T = any, R = any>() => useApiMutation<T, R>('PATCH'); 