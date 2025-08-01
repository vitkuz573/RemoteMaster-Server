# API System Documentation

## Overview

The RemoteMaster API system provides a comprehensive solution for connecting to backend APIs and displaying real-time data in the UI. It includes:

- **API Client**: Centralized HTTP client for API communication
- **React Hooks**: Easy-to-use hooks for data fetching and mutations
- **Context Provider**: Global state management for API operations
- **UI Components**: Ready-to-use components for displaying dynamic data

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │  React Hooks    │    │  API Context    │
│                 │    │                 │    │                 │
│ • ApiStatus     │◄──►│ • useApi        │◄──►│ • Global State  │
│ • DynamicData   │    │ • usePost       │    │ • Connection    │
│ • Skeleton      │    │ • usePut        │    │ • Errors        │
└─────────────────┘    │ • useDelete     │    │ • Pending       │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  API Client     │    │  Configuration  │
                       │                 │    │                 │
                       │ • HTTP Methods  │    │ • Endpoints     │
                       │ • Error Handling│    │ • Headers       │
                       │ • Response Types│    │ • Base URL      │
                       └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Setup API Provider

The `ApiProvider` is already configured in `app/layout.tsx`:

```tsx
import { ApiProvider } from '@/contexts/api-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
```

### 2. Use API Hooks

```tsx
import { useApi, usePost } from '@/hooks/use-api';

function MyComponent() {
  // Fetch data
  const { data, loading, error, refetch } = useApi('/api/users');
  
  // Mutate data
  const { mutate, loading: saving } = usePost();
  
  const handleCreateUser = async (userData) => {
    await mutate('/api/users', userData, {
      onSuccess: (data) => {
        console.log('User created:', data);
        refetch(); // Refresh the list
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
      }
    });
  };
  
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{/* Render data */}</div>}
    </div>
  );
}
```

### 3. Use UI Components

```tsx
import { ApiStatus, DynamicData, DataRenderers } from '@/components/ui/dynamic-data';

function Dashboard() {
  return (
    <div>
      {/* API Connection Status */}
      <ApiStatus showDetails />
      
      {/* Dynamic Data Display */}
      <DynamicData
        config={{
          endpoint: '/api/system/status',
          title: 'System Status',
          refreshInterval: 30000, // 30 seconds
          render: DataRenderers.status
        }}
      />
    </div>
  );
}
```

## API Client

### Configuration

The API client is configured in `lib/api-client.ts`:

```typescript
// Base URL is set from environment variable
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};
```

### Available Methods

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const response = await apiClient.get('/users', { page: 1, limit: 10 });

// POST request
const response = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });

// PUT request
const response = await apiClient.put('/users/123', { name: 'John Updated' });

// DELETE request
const response = await apiClient.delete('/users/123');

// PATCH request
const response = await apiClient.patch('/users/123', { status: 'active' });
```

### Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## React Hooks

### useApi Hook

For fetching data with automatic refresh:

```typescript
const { data, loading, error, refetch } = useApi(
  '/api/users',
  { page: 1 }, // Query parameters
  {
    enabled: true, // Enable/disable the hook
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Failed to load:', error)
  }
);
```

### Mutation Hooks

For data mutations:

```typescript
// POST requests
const { mutate, loading, error, data } = usePost();

// PUT requests
const { mutate, loading, error, data } = usePut();

// DELETE requests
const { mutate, loading, error, data } = useDelete();

// PATCH requests
const { mutate, loading, error, data } = usePatch();

// Usage
await mutate('/api/users', userData, {
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error)
});
```

## API Context

### Global State

The API context provides global state management:

```typescript
import { useApiContext } from '@/contexts/api-context';

function MyComponent() {
  const { state, setConnected, addError, clearErrors } = useApiContext();
  
  // Access global state
  console.log('Is connected:', state.isConnected);
  console.log('Last sync:', state.lastSync);
  console.log('Pending requests:', state.pendingRequests);
  console.log('Recent errors:', state.errors);
  
  // Update state
  setConnected(true);
  addError('Something went wrong');
  clearErrors();
}
```

### State Structure

```typescript
interface ApiState {
  isConnected: boolean;        // API connection status
  lastSync: Date | null;       // Last successful sync
  errors: string[];           // Recent error messages
  pendingRequests: number;    // Number of pending requests
}
```

## UI Components

### ApiStatus Component

Displays API connection status:

```tsx
import { ApiStatus } from '@/components/ui/api-status';

// Compact version
<ApiStatus compact />

// Full version with details
<ApiStatus showDetails />
```

### DynamicData Component

Displays real-time data from API endpoints:

```tsx
import { DynamicData, DataRenderers } from '@/components/ui/dynamic-data';

<DynamicData
  config={{
    endpoint: '/api/metrics',
    title: 'Performance Metrics',
    refreshInterval: 10000,
    transform: (data) => ({ ...data, value: data.value * 100 }), // Optional transformation
    render: DataRenderers.metric
  }}
  showRefreshButton={true}
/>
```

### Available Data Renderers

#### keyValue
For simple key-value pairs:

```typescript
DataRenderers.keyValue({
  cpu: '45%',
  memory: '2.1GB',
  disk: '75%'
})
```

#### metric
For numerical metrics with trends:

```typescript
DataRenderers.metric({
  value: 85,
  trend: 5.2,
  unit: '%'
})
```

#### status
For status indicators:

```typescript
DataRenderers.status({
  status: 'online',
  message: 'All systems operational'
})
```

#### list
For lists of items:

```typescript
DataRenderers.list([
  { id: '1', name: 'Server 1', status: 'online' },
  { id: '2', name: 'Server 2', status: 'offline' }
])
```

#### activity
For activity feeds:

```typescript
DataRenderers.activity([
  {
    id: '1',
    action: 'User login',
    timestamp: '2024-01-01T10:00:00Z',
    user: 'john.doe'
  }
])
```

## Environment Variables

Configure the API system using environment variables:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Health check endpoints
NEXT_PUBLIC_HEALTH_URL=http://localhost:3001/health
NEXT_PUBLIC_STATUS_URL=http://localhost:3001/status
```

## Error Handling

The API system provides comprehensive error handling:

1. **Network Errors**: Automatically caught and displayed
2. **HTTP Errors**: Status codes and error messages handled
3. **Global Error State**: Errors stored in context for display
4. **Retry Logic**: Automatic retries for failed requests
5. **Error Boundaries**: Graceful degradation on component errors

## Best Practices

### 1. Use TypeScript

Define types for your API responses:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const { data } = useApi<User[]>('/api/users');
```

### 2. Handle Loading States

Always show loading indicators:

```tsx
{loading && <Skeleton className="h-4 w-full" />}
```

### 3. Implement Error Boundaries

Wrap components that use API data:

```tsx
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <DynamicData config={config} />
</ErrorBoundary>
```

### 4. Use Appropriate Refresh Intervals

- **Real-time data**: 5-10 seconds
- **Frequently changing**: 15-30 seconds
- **Stable data**: 1-5 minutes
- **Static data**: No auto-refresh

### 5. Optimize Performance

- Use `enabled` option to conditionally fetch data
- Implement proper cleanup in useEffect
- Use React.memo for expensive components
- Consider implementing caching strategies

## Examples

See `app/api-demo/page.tsx` for a complete example of the API system in action.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API server allows requests from your frontend domain
2. **Network Errors**: Check if the API server is running and accessible
3. **Authentication**: Implement proper authentication headers if required
4. **Rate Limiting**: Handle 429 responses appropriately

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_API_DEBUG=true
```

This will log all API requests and responses to the console. 