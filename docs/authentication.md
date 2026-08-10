# Authentication

TVLore uses Supabase Auth with Google as the first identity provider.

Google proves who the user is. Supabase manages the OAuth exchange, session,
access token, and refresh token. TVLore owns the application user, authorization,
watch history, catalog records, and product data.

Do not use Gmail API.

## Conceptual Flow

```text
TVLore Mobile
  -> Supabase Auth signInWithOAuth(provider: google)
  -> Google consent/login
  -> Supabase Auth callback
  -> TVLore app deep link callback
  -> Supabase session stored on device
  -> TVLore API called with Authorization: Bearer <supabase_access_token>
```

## Redirects

Google redirects only to Supabase:

```text
https://qpekdijebjzigrgcumpv.supabase.co/auth/v1/callback
```

Supabase redirects back to the app through allowed callback URLs:

```text
tvlore://auth/callback
```

`tvlore://auth/callback` is the app callback used by development builds and
production builds. OAuth should not be validated in Expo Go because Expo Go does
not own the `tvlore://` scheme.

Expo Go can still be used for UI and backend smoke tests. Google OAuth requires a
development build or production build.

## Identity Model

Use separate conceptual entities:

```text
User

UserIdentity
|-- id
|-- userId
|-- provider
`-- providerSubject
```

`providerSubject` stores the stable subject from Supabase/Google. It should be
unique per provider.

Do not model the system as if Google will always be the only identity provider.
Apple may be added later.

## API Authentication

Protected TVLore API endpoints require:

```http
Authorization: Bearer <supabase_access_token>
```

The backend validates the Supabase access token, resolves the provider subject,
and finds or creates the matching TVLore `User` and `UserIdentity`.

## MVP Auth Endpoints

For the Supabase Auth path, the mobile app does not need custom TVLore endpoints
for login, refresh, or logout. Supabase handles those session operations.

The backend still needs authenticated user resolution:

- `GET /users/me`: returns the authenticated TVLore user.

Detailed endpoint contracts are in [API Design](api-design.md).

## Session Strategy

Use Supabase-managed sessions for the MVP:

- Supabase access token for API authorization.
- Supabase refresh token for persistent mobile login.
- Supabase client handles token refresh.
- Backend authorization on every protected route.
- No credentials logged.
- No database credentials, provider secrets, or service-role keys in mobile.

## Logout

Mobile calls Supabase sign-out and clears the local Supabase session. Backend
session revocation is not needed for the MVP unless TVLore adds custom sessions
later.

## Security Notes

- Never trust client-provided identity.
- Verify Supabase access tokens on the backend.
- Use HTTPS outside local development.
- Do not log credentials.
- Rate-limit protected backend routes where abuse matters.
- Keep Google Client Secret only in Supabase/Google configuration, never in the
  mobile app or Git.
