# 005 - Access and Refresh Token Strategy

## Status

Accepted

## Context

The primary client is mobile. Users expect persistent login, but protected API requests need short-lived credentials and revocation support.

## Decision

Use:

- Short-lived signed JWT access tokens.
- Opaque refresh tokens backed by server-side `RefreshSession` records.
- Refresh token hashes stored in PostgreSQL.
- Refresh credentials stored in Expo SecureStore.
- Refresh-session revocation on logout.
- Rotation considerations for refresh tokens.

Do not store sensitive tokens in AsyncStorage.

## Alternatives Considered

- JWT access and JWT refresh tokens: simpler stateless implementation, weaker revocation story for refresh credentials.
- Opaque access and opaque refresh tokens: strongest centralized control, but requires backend/session lookup on every request.
- Long-lived access token only: simpler, but poor security posture for mobile.

## Consequences

- Access-token verification is efficient.
- Refresh sessions remain revocable.
- Reuse detection and rotation can be implemented server-side.
- Tokens must be redacted from logs and analytics.
- Token lifetimes remain an unresolved production tuning decision.

## References

- https://docs.expo.dev/versions/latest/sdk/securestore/

