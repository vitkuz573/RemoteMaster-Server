// API Configuration - Switch between real and mock API
export const API_CONFIG = {
  // Set to true to use mock API for testing
  USE_MOCK_API: false,
  
  // Mock API settings
  MOCK_DELAY: {
    DEFAULT: 1000,
    REGISTRATION: 1500,
    LOGIN: 1200,
    BYOID: 2000,
    HEALTH: 300
  },
  
  // Mock credentials for testing
  MOCK_CREDENTIALS: {
    EMAIL: 'admin@acme.com',
    PASSWORD: 'password123'
  }
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