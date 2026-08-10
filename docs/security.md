# Security

TVLore's MVP security baseline should be practical, strict around identity/privacy, and light enough to implement.

## Baseline Controls

- HTTPS outside local development.
- Google credential verification on the backend.
- Short-lived access tokens.
- Secure refresh-token storage on device.
- Hashed refresh tokens in the database.
- Refresh-session revocation.
- Rotation considerations for refresh tokens.
- Backend authorization on protected routes.
- Request validation at transport boundaries.
- No TMDB credentials in the mobile bundle.
- No backend secrets in the mobile bundle.
- No secrets in logs.
- No raw authentication credentials in analytics.
- Rate limiting for auth endpoints.
- Rate limiting for expensive provider endpoints.
- Rate limiting for future match/share-link endpoints.
- Opaque QR/share tokens.
- Expiration and revocation of share tokens.
- Replay considerations for refresh and share tokens.
- Database constraints for ownership and uniqueness.
- OWASP-oriented input, auth, logging, and secret-handling baseline.
- Privacy-by-default data sharing.

## Threat Boundaries

The mobile client is untrusted. It can be modified, replayed, or run on compromised devices.

The backend must verify:

- The user identity.
- The session.
- The requested resource.
- Ownership.
- Authorization.
- Privacy settings.

## Provider Secrets

TMDB credentials must live only in backend configuration. The mobile app calls TVLore, never TMDB directly for authenticated catalog operations.

## Token Storage

- Access tokens may be held in memory and refreshed as needed.
- Refresh tokens must be stored in SecureStore.
- Tokens must not be stored in AsyncStorage.
- Tokens must not be printed in logs.

## Rate Limiting

Initial rate-limiting should cover:

- `POST /auth/google`
- `POST /auth/refresh`
- Search and provider-backed catalog endpoints
- Future match-link creation
- Future token resolution endpoints

Exact thresholds are unresolved and should be tuned before production.

## QR and Deep Link Safety

QR codes and deep links must never contain:

- Viewing history.
- Ratings.
- Email addresses.
- User IDs.
- Google identifiers.
- Authentication credentials.
- Private profile data.

Allowed shape:

```text
tvlore://match/{opaque-token}
https://tvlore.app/m/{opaque-token}
```

The backend resolves the token, authenticates the scanning user, checks privacy settings, calculates authorized derived results, and returns only what may be shown.

## Replay Considerations

Refresh tokens:

- Store hashes only.
- Rotate when possible.
- Detect reuse of old tokens.
- Revoke the session on suspicious reuse.

Match/share tokens:

- Use high-entropy opaque values.
- Expire tokens.
- Allow revocation.
- Avoid embedding identity or profile data.

## Logging Rules

Log:

- Correlation ID.
- User ID where appropriate.
- Endpoint and status.
- Auth failure reason category.
- Provider failure category.
- Latency.

Do not log:

- Access tokens.
- Refresh tokens.
- Google credentials.
- Provider secrets.
- Raw private viewing histories in error logs.
- QR/share token raw values beyond carefully redacted prefixes.

## Production Revisit

Before production, revisit:

- Token lifetimes.
- Refresh rotation policy.
- Rate-limit thresholds.
- Account deletion/data export requirements.
- Privacy settings UX.
- Mobile secure-storage failure handling.
- Provider outage behavior.
- Dependency security scanning.

