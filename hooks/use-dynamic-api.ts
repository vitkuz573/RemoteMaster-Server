/**
 * Dynamic API Hooks for RemoteMaster Server
 * React hooks for working with external HTTP APIs
 */

import { useState, useCallback, useEffect } from 'react';
import { dynamicApiClient, ApiResponse } from '@/lib/dynamic-api-client';

interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useDynamicApi<T = any>(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, any>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !baseUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dynamicApiClient.get<T>(baseUrl, endpoint, params);
      
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
  }, [baseUrl, endpoint, params, options.enabled, options.onSuccess, options.onError]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (options.refetchInterval && options.enabled) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval, options.enabled]);

  return { data, loading, error, refetch };
}

export function useDynamicApiMutation<T = any>(
  baseUrl: string,
  endpoint: string,
  options: UseApiMutationOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: any) => {
    if (!baseUrl) {
      setError('API URL not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dynamicApiClient.post<T>(baseUrl, endpoint, data);
      
      if (response.success && response.data) {
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        setError(response.error || 'Request failed');
        options.onError?.(response.error || 'Request failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, endpoint, options.onSuccess, options.onError]);

  return { mutate, loading, error };
}

// Convenience hooks for different HTTP methods
export function useDynamicPost<T = any>(baseUrl: string, endpoint: string, options?: UseApiMutationOptions) {
  return useDynamicApiMutation<T>(baseUrl, endpoint, options);
}

export function useDynamicPut<T = any>(baseUrl: string, endpoint: string, options?: UseApiMutationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: any) => {
    if (!baseUrl) {
      setError('API URL not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dynamicApiClient.put<T>(baseUrl, endpoint, data);
      
      if (response.success && response.data) {
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        setError(response.error || 'Request failed');
        options?.onError?.(response.error || 'Request failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, endpoint, options]);

  return { mutate, loading, error };
}

export function useDynamicDelete<T = any>(baseUrl: string, endpoint: string, options?: UseApiMutationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async () => {
    if (!baseUrl) {
      setError('API URL not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dynamicApiClient.delete<T>(baseUrl, endpoint);
      
      if (response.success && response.data) {
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        setError(response.error || 'Request failed');
        options?.onError?.(response.error || 'Request failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, endpoint, options]);

  return { mutate, loading, error };
}

export function useDynamicPatch<T = any>(baseUrl: string, endpoint: string, options?: UseApiMutationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: any) => {
    if (!baseUrl) {
      setError('API URL not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dynamicApiClient.patch<T>(baseUrl, endpoint, data);
      
      if (response.success && response.data) {
        options?.onSuccess?.(response.data);
        return response.data;
      } else {
        setError(response.error || 'Request failed');
        options?.onError?.(response.error || 'Request failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, endpoint, options]);

  return { mutate, loading, error };
} 