// API Configuration - Simple and clean
import { appConfig } from './app-config';

export const API_CONFIG = {
  // API base URL
  BASE_URL: appConfig.endpoints.api,
  
  // Mock credentials for testing
  MOCK_CREDENTIALS: {
    EMAIL: 'admin@acme.com',
    PASSWORD: 'password123'
  }
};

// Helper function to get the appropriate API service
export async function getApiService() {
  // Use the original api service - MSW will handle mocking automatically in development
  return (await import('./api-service')).apiService;
} 