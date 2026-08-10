# 004 - Authentication

## Status

Accepted

## Context

TVLore needs mobile authentication and should start with Google. The product
already uses Supabase for PostgreSQL and can reuse Supabase Auth instead of
owning the OAuth exchange and refresh-token implementation from day one.

## Decision

Use Supabase Auth with Google as the first identity provider.

Mobile flow:

1. Mobile starts `signInWithOAuth` with provider `google`.
2. Supabase redirects the user to Google.
3. Google redirects back to Supabase.
4. Supabase redirects back to the app through a deep link.
5. Mobile stores the Supabase session through the Supabase client.
6. Mobile calls TVLore API with `Authorization: Bearer <supabase_access_token>`.
7. API validates the Supabase token and resolves or creates the TVLore `User`.

Use separate `User` and `UserIdentity` concepts.

Do not use Gmail API.

## Alternatives Considered

- TVLore-owned Google OIDC flow and tokens: more control, but more security
  surface before the product needs it.
- Firebase Authentication: good managed auth option, but adding it beside
  Supabase duplicates identity infrastructure.
- Email/password: increases account security surface and is not needed for the
  first identity path.
- Google-only user table: simpler now, but blocks future Apple or other identity
  providers.

## Consequences

- Supabase owns OAuth callback handling and session refresh for the MVP.
- TVLore still owns product authorization and data.
- Backend protected routes must validate Supabase access tokens.
- Future Apple sign-in can map to the same `UserIdentity` pattern.
- Custom TVLore refresh sessions can be added later only if Supabase sessions no
  longer satisfy product/security needs.

## References

- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/native-mobile-deep-linking
- https://docs.expo.dev/versions/latest/sdk/webbrowser/
