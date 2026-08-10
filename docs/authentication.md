# Authentication

TVLore uses Google Identity/OpenID Connect for external identity and TVLore-owned credentials for application access.

Google proves who the user is. TVLore owns the application user, session, authorization, and product data.

Do not use Gmail API.

## Conceptual Flow

```text
TVLore Mobile
  -> Google Sign-In
  -> Google credential
  -> TVLore API
  -> Verify credential with Google
  -> Resolve UserIdentity
  -> Find/Create TVLore User
  -> Issue TVLore credentials
  -> Store sensitive credentials in SecureStore
```

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

`providerSubject` stores the stable subject from the identity provider. It should be unique per provider.

Do not model the system as if Google will always be the only identity provider. Apple may be added later.

## API Endpoints

- `POST /auth/google`: accepts a Google credential and returns TVLore credentials.
- `POST /auth/refresh`: rotates or refreshes TVLore credentials.
- `POST /auth/logout`: revokes the current refresh session.
- `GET /users/me`: returns the authenticated TVLore user.

Detailed contracts are in [API Design](api-design.md).

## Token and Session Strategy

Because the primary client is mobile, use an access-token plus refresh-token model:

- Short-lived access token.
- Longer-lived refresh token.
- Secure storage for refresh credentials.
- Refresh-session record in PostgreSQL.
- Token rotation considerations.
- Server-side revocation.
- Explicit logout.
- Backend authorization on every protected route.
- No credentials logged.
- No sensitive tokens stored in AsyncStorage.

## Access Token Decision

Use short-lived signed JWT access tokens for MVP API authorization.

Rationale:

- They are efficient for stateless request authentication.
- They fit standard NestJS guard patterns.
- Short lifetimes reduce impact if leaked.
- They avoid a database lookup on every request for the MVP.

Constraints:

- The backend still verifies authorization and ownership.
- The JWT must contain minimal claims: TVLore user ID, session ID, issued-at, expiration, issuer, audience.
- Do not put email, viewing data, Google profile data, or permissions lists in the token.
- Keep access tokens short-lived.

## Refresh Token Decision

Use opaque refresh tokens backed by server-side refresh-session records.

Rationale:

- Refresh tokens need revocation.
- Rotation and reuse detection are easier with server-side state.
- The client should not inspect token contents.

Store only a hash of the refresh token in PostgreSQL. The raw token is returned once to the client and stored in SecureStore.

## Refresh Flow

1. Mobile detects an expired or soon-to-expire access token.
2. Mobile sends the refresh token to `POST /auth/refresh`.
3. API hashes and validates the refresh token against an active refresh session.
4. API checks expiration, revocation, and reuse indicators.
5. API rotates the refresh token when configured.
6. API issues a new short-lived access token.
7. API returns the new refresh token if rotation occurs.
8. Mobile updates SecureStore.

If refresh fails, the mobile app clears local credentials and returns to authentication.

## Logout

Logout revokes the current refresh session server-side and clears local SecureStore values client-side.

Logout should succeed from the user's perspective even if local cleanup is the only step that completes, but the app should attempt backend revocation first when online.

## Security Notes

- Never trust client-provided identity.
- Verify Google credentials on the backend.
- Use HTTPS outside local development.
- Do not log credentials.
- Do not store sensitive tokens in AsyncStorage.
- Rate-limit authentication endpoints.
- Design refresh sessions for revocation.

