# Migration to External API

## Overview of Changes

All operations on application pages have been migrated from local API endpoints to the external API specified in `appconfig.endpoints.api`.

## Modified Files

### 1. New API Service Created
- `lib/api-service.ts` - centralized service for all API calls

### 2. Updated Pages
- `app/register/page.tsx` - organization registration
- `app/login/page.tsx` - system login (renamed from /tenant)
- `app/byoid-setup/page.tsx` - BYOID setup
- `app/admin/page.tsx` - admin panel

### 3. Updated Components
- `components/ui/footer.tsx` - system status check

### 4. UI Improvements
- Fixed text formatting in login page security notice
- Renamed `/tenant` route to `/login` for better UX

## API Endpoints

The external API must support the following endpoints:

### Organizations
- `POST /organizations/register` - register new organization
- `GET /organizations` - get list of organizations
- `GET /organizations?domain={domain}` - search by domain
- `GET /organizations?id={id}` - search by ID

### Authentication
- `POST /auth/login` - system login

### BYOID (Bring Your Own Identity)
- `POST /byoid-setup` - submit BYOID setup request
- `GET /byoid-setup` - get list of BYOID requests
- `GET /byoid-setup?organizationId={id}` - get BYOID request for organization

### System
- `GET /health` - system health check
- `GET /test-connection` - connection testing

## Configuration

The external API URL is configured through the `NEXT_PUBLIC_API_URL` environment variable or defaults to `http://localhost:3001`.

## API Response Structure

### Organization Registration
```json
{
  "success": true,
  "organization": {
    "id": "org_123",
    "tenantId": "tenant_456",
    "name": "Organization Name",
    "domain": "example.com",
    "status": "active",
    "plan": "free",
    "idpConfig": {
      "provider": "internal",
      "clientId": "client_123",
      "clientSecret": "secret_456",
      "domain": "example.com"
    }
  },
  "message": "Organization registered successfully!"
}
```

### System Login
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "organization": {
      "id": "org_123",
      "name": "Organization Name",
      "domain": "example.com",
      "tenantId": "tenant_456"
    }
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

### Organizations List
```json
{
  "organizations": [
    {
      "id": "org_123",
      "name": "Organization Name",
      "domain": "example.com",
      "status": "active",
      "plan": "free",
      "registeredAt": "2024-01-01T00:00:00Z",
      "byoidConfig": null
    }
  ]
}
```

### System Status
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "2.1.4",
  "message": "System is operational",
  "services": {
    "database": "healthy",
    "api": "healthy"
  },
  "checkResults": {
    "database": {
      "name": "Database",
      "status": "healthy"
    },
    "api": {
      "name": "API Gateway",
      "status": "healthy"
    }
  }
}
```

## Local API Endpoints

The following local API endpoints are no longer used and can be removed:
- `app/api/register/route.ts`
- `app/api/organizations/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/byoid-setup/route.ts`
- `app/api/health/route.ts`

## Testing

To test the migration:

1. Ensure the external API is available at the address specified in `appconfig.endpoints.api`
2. Check all main functions:
   - Organization registration
   - System login
   - BYOID setup
   - Admin panel
   - System status check

## Backward Compatibility

If the external API is unavailable, the application will show connection errors. It is recommended to add a fallback mechanism or connection status indicators. 