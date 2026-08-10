# 004 - Authentication

## Status

Accepted

## Context

TVLore needs mobile authentication and should start with Google. Google should prove external identity, but TVLore must own application users, sessions, and product data.

## Decision

Use Google Identity/OpenID Connect for initial sign-in.

Backend flow:

1. Mobile obtains a Google credential.
2. Mobile sends it to TVLore API.
3. API verifies the credential with Google.
4. API resolves or creates `UserIdentity`.
5. API resolves or creates `User`.
6. API issues TVLore credentials.

Use separate `User` and `UserIdentity` concepts.

Do not use Gmail API.

## Alternatives Considered

- Firebase Authentication: good managed auth option, but this architecture keeps TVLore identity/session ownership explicit and backend-owned.
- Email/password: increases account security surface and is not needed for the first identity path.
- Google-only user table: simpler now, but blocks future Apple or other identity providers.

## Consequences

- TVLore owns user identity even when Google is the first provider.
- Future Apple sign-in can map to the same `UserIdentity` pattern.
- Backend must verify provider credentials and never trust client-provided identity.
- Mobile stores TVLore credentials, not Google as a permanent app session.

## References

- https://developers.google.com/identity/openid-connect/openid-connect

