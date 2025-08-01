/**
 * Dynamic API Client for RemoteMaster Server
 * Can work with any external HTTP API by accepting the base URL as a parameter
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class DynamicApiClient {
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!baseUrl) {
      return {
        success: false,
        error: 'API URL not configured. Please provide a valid API URL.',
      };
    }

    // Ensure baseUrl ends with / and endpoint doesn't start with /
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBaseUrl}${cleanEndpoint}`;

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle cases where response is not JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, treat it as text
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      // Handle network errors and other issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a network error
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_NETWORK') ||
          errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
        return {
          success: false,
          error: 'Network error: Unable to connect to server',
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // GET request
  async get<T>(baseUrl: string, endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(baseUrl, url, { method: 'GET' });
  }

  // POST request
  async post<T>(baseUrl: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(baseUrl, endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(baseUrl: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(baseUrl, endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(baseUrl: string, endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(baseUrl, endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(baseUrl: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(baseUrl, endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Test connection to API
  async testConnection(baseUrl: string, endpoint: string = '/health'): Promise<ApiResponse> {
    return this.get(baseUrl, endpoint);
  }
}

export const dynamicApiClient = new DynamicApiClient(); 