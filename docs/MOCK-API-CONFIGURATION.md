# Mock API Configuration

This document describes the centralized Mock API configuration system that has been extracted from the mock service implementation.

## Overview

The Mock API configuration has been centralized into a dedicated configuration file (`lib/mock-api-config.ts`) to improve maintainability, reusability, and ease of configuration.

## Files Structure

- `lib/mock-api-config.ts` - Centralized mock configuration
- `lib/api-config.ts` - Main API configuration (now imports mock config)
- `lib/api-service-mock.ts` - Mock API service (now uses centralized config)

## Configuration Options

### Basic Settings

```typescript
export const MOCK_API_CONFIG = {
  // Enable/disable mock API
  ENABLED: true,
  
  // Delay settings for simulating network latency
  DELAYS: {
    DEFAULT: 1000,
    REGISTRATION: 1500,
    LOGIN: 1200,
    BYOID: 2000,
    HEALTH: 300,
    // ... more delay settings
  },
  
  // Mock credentials for testing
  CREDENTIALS: {
    EMAIL: 'admin@acme.com',
    PASSWORD: 'password123'
  }
}
```

### Mock Data

The configuration includes centralized mock data for:

- **Organizations**: Sample organizations with different statuses and plans
- **Pricing Plans**: Free, Pro, Business, and Enterprise plans
- **Industries**: Common industry types
- **Company Sizes**: Employee count ranges
- **User Data**: Current user information
- **BYOID Configuration**: OpenID Connect settings
- **Health Check**: Service health information

### Helper Functions

The `MockConfigHelpers` object provides utility functions:

```typescript
// Get delay for specific operation
MockConfigHelpers.getDelay('LOGIN') // Returns 1200ms

// Generate random ID
MockConfigHelpers.generateId('org') // Returns 'org_1234567890_abc123'

// Generate temporary password
MockConfigHelpers.generateTempPassword() // Returns random password

// Check if plan is unlimited
MockConfigHelpers.isUnlimitedPlan('enterprise') // Returns true

// Get plan by ID
MockConfigHelpers.getPlanById('pro') // Returns pro plan object

// Calculate user cost
MockConfigHelpers.calculateUserCost('pro', 50) // Returns calculated cost
```

## Usage

### Enabling/Disabling Mock API

To switch between mock and real API, simply change the `ENABLED` setting:

```typescript
// In lib/mock-api-config.ts
export const MOCK_API_CONFIG = {
  ENABLED: true,  // Use mock API
  // or
  ENABLED: false, // Use real API
  // ... rest of config
}
```

### Customizing Mock Data

You can easily customize any mock data by modifying the configuration:

```typescript
// Add new pricing plan
PRICING_PLANS: [
  // ... existing plans
  {
    id: 'custom',
    name: 'Custom Plan',
    price: 199,
    // ... other properties
  }
]

// Modify credentials
CREDENTIALS: {
  EMAIL: 'your-test-email@example.com',
  PASSWORD: 'your-test-password'
}
```

### Adjusting Delays

Customize response delays to simulate different network conditions:

```typescript
DELAYS: {
  DEFAULT: 500,      // Faster responses
  REGISTRATION: 2000, // Slower registration
  LOGIN: 800,        // Medium login time
  // ... other delays
}
```

## Benefits

1. **Centralized Configuration**: All mock settings in one place
2. **Easy Customization**: Simple to modify mock data and behavior
3. **Type Safety**: Full TypeScript support with exported types
4. **Reusability**: Configuration can be used across different parts of the application
5. **Maintainability**: Changes to mock data don't require modifying service code
6. **Testing**: Easy to switch between different mock scenarios

## Type Definitions

The configuration exports TypeScript types for better type safety:

```typescript
import type { 
  MockApiConfig, 
  MockDelayConfig, 
  MockPricingPlan, 
  MockOrganization 
} from './mock-api-config';
```

## Migration Notes

- All hardcoded mock data has been moved to the configuration file
- The mock service now uses the centralized configuration
- Helper functions provide consistent behavior across the application
- The main API configuration imports and re-exports the mock configuration

## Best Practices

1. **Keep Configuration Separate**: Don't mix mock data with service logic
2. **Use Helper Functions**: Leverage `MockConfigHelpers` for consistent behavior
3. **Document Changes**: Update this documentation when adding new mock data
4. **Version Control**: Track configuration changes in version control
5. **Environment-Specific**: Consider environment-specific mock configurations 