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
MIGRATE_DATABASE_URL
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
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
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

Use the tracked `.env.example` files as the variable contract and local `.env`
files for real machine-specific values:

```bash
corepack pnpm env:check
```

The env check verifies local `.env` files against their `.env.example`
contracts and verifies that Vercel `tvlore-api` has the required server-side
keys configured for Production and Preview.

Examples:

- `DATABASE_URL` must be a valid PostgreSQL connection string.
- `MIGRATE_DATABASE_URL` should be a direct or session PostgreSQL connection string for Prisma migrations.
- `TMDB_ACCESS_TOKEN` must be present in non-test environments.
- `GOOGLE_CLIENT_ID` must be present for authentication.
- Signing keys must meet minimum length/entropy requirements.
- Token TTL values must parse as positive durations.

## Secrets

- Do not commit secrets.
- Keep real local values in ignored `.env` files.
- Use `.env.example` only when implementation begins and only with placeholder values.
- Store production secrets in the deployment platform's secret manager.
- Redact secrets in logs and error reports.

## Current Deploy Targets

- API: `https://tvlore-api.vercel.app`
- Supabase project URL: `https://qpekdijebjzigrgcumpv.supabase.co`
- Supabase project ref: `qpekdijebjzigrgcumpv`

`DATABASE_URL` and `MIGRATE_DATABASE_URL` must be configured in Vercel for production database connectivity.
