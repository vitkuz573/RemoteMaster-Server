// API Configuration - Switch between real and mock API
import { MOCK_API_CONFIG } from './mock-api-config';

export const API_CONFIG = {
  // Set to true to use mock API for testing
  USE_MOCK_API: MOCK_API_CONFIG.ENABLED,
  
  // Mock API settings (now imported from centralized config)
  MOCK_DELAY: MOCK_API_CONFIG.DELAYS,
  
  // Mock credentials for testing (now imported from centralized config)
  MOCK_CREDENTIALS: MOCK_API_CONFIG.CREDENTIALS
};

// Helper function to get the appropriate API service
export async function getApiService() {
  if (API_CONFIG.USE_MOCK_API) {
    // Dynamic import to avoid loading mock in production
    return (await import('./api-service-mock')).mockApiService;
  } else {
    return (await import('./api-service')).apiService;
  }
}

// Helper function to check if mock API is enabled
export function isMockApiEnabled(): boolean {
  return API_CONFIG.USE_MOCK_API;
}

// Re-export mock configuration for easy access
export { MOCK_API_CONFIG, MockConfigHelpers } from './mock-api-config'; 