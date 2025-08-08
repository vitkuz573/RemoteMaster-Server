Auth Architecture (Frontend)

Overview
- Client-only session layer with enterprise practices: bearer auth, refresh tokens, proactive refresh, role-based guards, cross-tab logout sync.
- Tokens are kept in memory (Zustand store) and are NOT persisted to localStorage.
- All requests attach Authorization automatically; 401 triggers a single refresh attempt and retries the request.

Key Pieces
- useAuth(options): Manages auth state, token hydration, redirect logic, role checks, and proactive refresh.
  - options: { redirectOnUnauthed, redirectPath, skipPaths, hydrateUser, requiredRoles }
  - Redirects to login with returnTo query preserving the intended URL.
- AuthGate: Wrapper to protect pages/sections; supports required roles via useAuth options.
- apiService: Adds bearer token, auto refresh on 401, exposes refreshSession for scheduled refreshes.
- BroadcastChannel: Logout sync across browser tabs.

Return-To Flow
- Unauthed access to a protected page triggers redirect to `/login?returnTo=/original/path?...`.
- On successful login, user is routed back to returnTo (safe-guarded to internal paths).

Roles
- Pass `requiredRoles` to `useAuth` or to `AuthGate` (via options) to enforce role checks.

Security Notes
- Do not persist tokens to localStorage/sessionStorage.
- For production, prefer server-managed sessions with httpOnly cookies; this client layer is designed to be compatible with such a backend.

Usage Examples
1) Page gate:
   <AuthGate options={{ requiredRoles: ['admin'] }} fallback={<Spinner />}> <Admin /> </AuthGate>
2) Hook-only:
   const auth = useAuth({ requiredRoles: ['user'] });
   if (!auth.isAuthenticated) return null;

