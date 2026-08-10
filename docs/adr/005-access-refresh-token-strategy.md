# 005 - Access and Refresh Token Strategy

## Status

Accepted

## Context

The primary client is mobile. Users expect persistent login, and protected API
requests need credentials that the backend can validate.

ADR 004 selects Supabase Auth for the MVP.

## Decision

Use Supabase-managed sessions for MVP authentication:

- Supabase access token for protected TVLore API requests.
- Supabase refresh token managed by `@supabase/supabase-js`.
- Supabase client persistence on device.
- Backend validation of Supabase access tokens.

Do not create TVLore-owned access or refresh tokens for the MVP.

## Alternatives Considered

- TVLore signed JWT access tokens plus opaque refresh tokens: more ownership and
  revocation control, but unnecessary until we outgrow Supabase Auth.
- Opaque TVLore access and refresh tokens: strongest centralized control, but
  requires backend/session lookup on every request.
- Long-lived access token only: simpler, but poor security posture for mobile.

## Consequences

- Less custom security code in the MVP.
- Backend auth work focuses on token verification and user resolution.
- Logout and refresh are delegated to Supabase.
- Token revocation behavior follows Supabase Auth unless custom sessions are
  introduced later.
- Tokens must still be redacted from logs and analytics.

## References

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/jwts
