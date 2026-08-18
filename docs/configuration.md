# Configuration

Initial environments:

- `local`
- `development`
- `production`

Do not introduce staging or QA until there is a concrete need.

## Backend Environment Variables

Runtime variables:

```text
NODE_ENV
PORT
DATABASE_URL
MIGRATE_DATABASE_URL
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
TMDB_ACCESS_TOKEN
API_RATE_LIMIT_MAX_REQUESTS
API_RATE_LIMIT_WINDOW_SECONDS
PROVIDER_RATE_LIMIT_MAX_REQUESTS
PROVIDER_RATE_LIMIT_WINDOW_SECONDS
```

`NODE_ENV` and `PORT` are optional runtime/platform values. `NODE_ENV`
defaults to `development` when omitted. `PORT` defaults to `3000`.

Rate-limit variables are optional tuning knobs. If omitted, the API uses `180`
general requests per `60` seconds and `40` provider-cost requests per `60`
seconds per client key.

## Mobile Configuration

Runtime values:

```text
EXPO_PUBLIC_TVLORE_API_BASE_URL
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Only public/mobile-safe values may be included in the mobile bundle.

Local mobile development reads these values from `apps/mobile/.env`. EAS cloud
builds read them from the EAS project environment selected by
`apps/mobile/eas.json`:

```text
development
preview
production
```

Use the same variable names in each EAS environment. Values can be the same
while TVLore has one backend and one Supabase project.

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
- `SUPABASE_URL` must match the Supabase project URL when backend auth verification is implemented.
- `SUPABASE_PUBLISHABLE_KEY` must be available to verify Supabase-authenticated flows where needed.
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only and enables `DELETE /users/me` to delete the Supabase Auth user. Never expose it to mobile.
- `TMDB_ACCESS_TOKEN` must be present for the backend catalog provider. Use the TMDB API Read Access Token, not the shorter API key.
- `API_RATE_LIMIT_MAX_REQUESTS` and `API_RATE_LIMIT_WINDOW_SECONDS` tune the general API rate limit.
- `PROVIDER_RATE_LIMIT_MAX_REQUESTS` and `PROVIDER_RATE_LIMIT_WINDOW_SECONDS` tune TMDB/provider-cost route protection.

## Secrets

- Do not commit secrets.
- Keep real local values in ignored `.env` files.
- Use `.env.example` only when implementation begins and only with placeholder values.
- Store production secrets in the deployment platform's secret manager.
- Store production mobile build variables in EAS project environments.
- Redact secrets in logs and error reports.

## Current Deploy Targets

- API: `https://tvlore-api.vercel.app`
- Supabase project URL: `https://qpekdijebjzigrgcumpv.supabase.co`
- Supabase project ref: `qpekdijebjzigrgcumpv`

`DATABASE_URL` and `MIGRATE_DATABASE_URL` must be configured in Vercel for production database connectivity.
Google OAuth Client ID and Client Secret are configured in Supabase Auth, not in
the TVLore repository or mobile bundle.
Apple Sign-In identifiers, keys, and provider settings are configured in Apple
Developer and Supabase Auth. TVLore mobile does not need Apple secrets in env;
it only uses the native Apple identity token returned by iOS.
