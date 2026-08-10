# Infrastructure Setup

This document tracks the deployed infrastructure and local development setup for TVLore.

## Source Control

- Repository: `https://github.com/luiskabal/tvlore`
- Default branch: `main`
- Monorepo package manager: `pnpm` through Corepack.
- Local command style: use `corepack pnpm ...`, not bare `pnpm`.

## Backend API

- App: `apps/api`
- Runtime: NestJS on Vercel Functions.
- Public URL: `https://tvlore-api.vercel.app`
- Vercel project: `tvlore-api`
- Vercel root directory: `apps/api`

Vercel project settings:

```text
Preset: NestJS
Root Directory: apps/api
Install Command: corepack pnpm install --frozen-lockfile
Build Command: corepack pnpm build
Output Directory: public
```

Current deployed endpoints:

```text
GET /
GET /health
GET /health/db
GET /health/error
GET /users/me
```

`GET /health/db` verifies runtime connectivity from Vercel to PostgreSQL. If Vercel has no `DATABASE_URL`, the API fails during startup.

## Database

- Provider: Supabase Postgres.
- Project ref: `qpekdijebjzigrgcumpv`
- Project URL: `https://qpekdijebjzigrgcumpv.supabase.co`
- ORM: Prisma.
- Prisma schema: `apps/api/prisma/schema.prisma`
- Initial migration: `apps/api/prisma/migrations/20260810162500_init_user/migration.sql`
- Applied migration: `20260810162500_init_user`
- Current database tables: `_prisma_migrations`, `users`

Vercel environment variables:

```text
DATABASE_URL
MIGRATE_DATABASE_URL
```

`DATABASE_URL` is used by the API at runtime. Use the Supabase Transaction Pooler:

```text
postgresql://postgres.qpekdijebjzigrgcumpv:YOUR_PASSWORD@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

`MIGRATE_DATABASE_URL` is used by Prisma migrations. Use the direct connection:

```text
postgresql://postgres:YOUR_PASSWORD@db.qpekdijebjzigrgcumpv.supabase.co:5432/postgres
```

Do not commit real database passwords.

Migration command:

```bash
corepack pnpm db:migrate:deploy
```

Local migration setup:

1. Create `apps/api/.env` from `apps/api/.env.example`.
2. Replace `YOUR_PASSWORD` with the real Supabase database password.
3. Run:

```bash
corepack pnpm db:migrate:deploy
```

Local API setup:

1. Create `apps/api/.env` from `apps/api/.env.example`.
2. Replace `YOUR_PASSWORD` with the real Supabase database password.
3. Validate local and Vercel environment coverage:

```bash
corepack pnpm env:check
```

4. Restart the API:

```bash
corepack pnpm --filter @tvlore/api build
corepack pnpm --filter @tvlore/api start
```

Public API verification command:

```bash
corepack pnpm api:check
```

The API validates `DATABASE_URL` during Nest application startup. If the
variable is missing after loading local `.env`, the app fails to boot instead
of exposing partial routes with a broken database dependency.

## Mobile App

- App: `apps/mobile`
- Runtime: Expo SDK 54.
- Current API target for device testing: `https://tvlore-api.vercel.app`
- Supabase client baseline exists for future Auth/session work.
- Core product data should still go through the backend API, not direct table access from mobile.

Public mobile environment variables:

```text
EXPO_PUBLIC_TVLORE_API_BASE_URL=https://tvlore-api.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://qpekdijebjzigrgcumpv.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Local mobile setup uses `apps/mobile/.env` with the same keys as
`apps/mobile/.env.example`.

Local iPhone testing command:

```powershell
$env:EXPO_PUBLIC_TVLORE_API_BASE_URL="https://tvlore-api.vercel.app"
$env:EXPO_PUBLIC_SUPABASE_URL="https://qpekdijebjzigrgcumpv.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
corepack pnpm --filter @tvlore/mobile start -- --clear --port 8081
```

Then open Expo Go with the LAN URL printed by Metro, currently:

```text
exp://192.168.100.6:8081
```

## Postman

Files:

```text
tools/postman/tvlore.postman_collection.json
tools/postman/tvlore.local.postman_environment.json
tools/postman/tvlore.vercel.postman_environment.json
```

Use the `TVLore Vercel` environment to test the deployed API.

## Current Infra Checklist

- GitHub repository is connected.
- Vercel backend deploy is live.
- Mobile app can call the Vercel API from iPhone through Expo Go.
- Supabase mobile client baseline is present.
- Prisma schema and initial migration exist.
- Vercel `tvlore-api` has Supabase env vars configured.
- `GET /health/db` returns `200` from production.
- Initial Prisma migration has been applied to Supabase.
