# Authentication

TVLore uses Supabase Auth with Google and Apple as identity providers.

Google or Apple prove who the user is. Supabase manages the identity exchange,
session, access token, and refresh token. TVLore owns the application user,
authorization, watch history, catalog records, and product data.

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

On iOS, Apple uses the native AuthenticationServices flow instead of a browser
OAuth callback:

```text
TVLore Mobile iOS
  -> AppleAuthentication.signInAsync()
  -> Apple native sign-in sheet
  -> Apple identityToken
  -> Supabase Auth signInWithIdToken(provider: apple)
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
tvlore:///auth/callback
```

`tvlore:///auth/callback` is the app callback used by development builds and
production builds. The triple slash keeps `/auth/callback` as the route path
instead of treating `auth` as a URL host. The mobile callback parser still
accepts the legacy `tvlore://auth/callback` shape for compatibility. OAuth
should not be validated in Expo Go because Expo Go does not own the `tvlore://`
scheme.

Expo Go can still be used for UI and backend smoke tests. Google OAuth requires a
development build or production build.

Apple Sign-In is native iOS auth. TVLore enables the Expo
`expo-apple-authentication` plugin and `ios.usesAppleSignIn` capability. Real
release testing requires the Apple Developer App ID for
`com.luiskabal.tvlore` to have Sign in with Apple enabled, and the Supabase
Apple provider must accept the app's Apple client ID / bundle ID. If a web
Services ID is also configured, keep that Services ID first in Supabase's Apple
Client IDs list and include the native app ID as an accepted audience.

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

`providerSubject` stores the stable subject from Supabase. It should be unique
per provider.

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
- `PATCH /users/me`: updates authenticated user-owned settings such as availability country.
- `DELETE /users/me`: deletes the authenticated TVLore user data and Supabase Auth account.

Detailed endpoint contracts are in [API Design](api-design.md).

## Session Strategy

Use Supabase-managed sessions for the MVP:

- Supabase access token for API authorization.
- Supabase refresh token for persistent mobile login.
- Supabase client handles token refresh.
- Backend authorization on every protected route.
- No credentials logged.
- No database credentials, provider secrets, or service-role keys in mobile.

The Supabase service-role key is backend-only and is used only for server-side
account deletion through the Supabase Admin API.

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
- Keep Google and Apple provider secrets only in provider/Supabase
  configuration, never in the mobile app or Git.
