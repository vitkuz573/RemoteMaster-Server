// API Configuration - Simple and clean
import { appConfig } from './app-config';

export const API_CONFIG = {
  // API base URL
  BASE_URL: appConfig.endpoints.api,
  
  MOCK_CREDENTIALS: {
    EMAIL: 'admin@acme.com',
    PASSWORD: 'password123'
  }
}; 