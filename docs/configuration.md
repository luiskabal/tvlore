# Configuration

Initial environments:

- `local`
- `development`
- `production`

Do not introduce staging or QA until there is a concrete need.

## Backend Environment Variables

Conceptual variables:

```text
NODE_ENV
PORT
DATABASE_URL
TMDB_ACCESS_TOKEN
GOOGLE_CLIENT_ID
ACCESS_TOKEN_SIGNING_KEY
REFRESH_TOKEN_SECRET
ACCESS_TOKEN_ISSUER
ACCESS_TOKEN_AUDIENCE
ACCESS_TOKEN_TTL_SECONDS
REFRESH_TOKEN_TTL_DAYS
LOG_LEVEL
```

Names may be refined during implementation, but the responsibilities should remain clear.

## Mobile Configuration

Conceptual values:

```text
EXPO_PUBLIC_TVLORE_API_BASE_URL
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
```

Only public/mobile-safe values may be included in the mobile bundle.

Do not include:

- `TMDB_ACCESS_TOKEN`
- Database credentials
- Backend signing keys
- Refresh-token secrets
- Provider server secrets

## Validation

Backend configuration should be validated at startup.

The API should fail fast if required configuration is missing or malformed.

Examples:

- `DATABASE_URL` must be a valid PostgreSQL connection string.
- `TMDB_ACCESS_TOKEN` must be present in non-test environments.
- `GOOGLE_CLIENT_ID` must be present for authentication.
- Signing keys must meet minimum length/entropy requirements.
- Token TTL values must parse as positive durations.

## Secrets

- Do not commit secrets.
- Do not create `.env` files as part of documentation or scaffolding tasks.
- Use `.env.example` only when implementation begins and only with placeholder values.
- Store production secrets in the deployment platform's secret manager.
- Redact secrets in logs and error reports.

