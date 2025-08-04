# MSW Integration

Elegant API mocking using Mock Service Worker following best practices.

## Structure

```
src/mocks/
├── handlers.ts    # Request handlers for all API endpoints
├── browser.ts     # Browser worker setup  
├── node.ts        # Node.js server setup (for testing)
└── README.md      # This file
```

## Usage

### Enable MSW

Create `.env.local`:
```
NEXT_PUBLIC_USE_MOCK_API=true
```

### Mock Credentials

- Email: `admin@acme.com`
- Password: `password123`

## How it works

1. MSW intercepts real `fetch()` requests at the network level
2. No changes needed in your API service code
3. Handlers return realistic mock responses
4. Easy to enable/disable with environment variable

## Benefits

- ✅ Real HTTP requests (not stubbed)
- ✅ Single API service for real and mock
- ✅ Network-level interception
- ✅ Realistic delays and responses
- ✅ TypeScript support

## Adding new endpoints

1. Add handler to `handlers.ts`:
```ts
http.get('/api/new-endpoint', async () => {
  await delay(200)
  return HttpResponse.json({ data: 'mock response' })
})
```

2. That's it! Your existing API service will automatically use the mock.