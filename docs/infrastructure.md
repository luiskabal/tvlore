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
GET /privacy
GET /terms
GET /support
GET /account-deletion
GET /users/me
PATCH /users/me
DELETE /users/me
GET /search
POST /catalog/resolve
GET /shows/:showId
GET /shows/:showId/cast
GET /shows/:showId/watch-providers
GET /shows/:showId/seasons
GET /shows/:showId/seasons/:seasonNumber
POST /shows/:showId/seasons/:seasonNumber/watches
DELETE /shows/:showId/seasons/:seasonNumber/watches
POST /shows/:showId/watches
DELETE /shows/:showId/watches
POST /shows/:showId/watchlist
DELETE /shows/:showId/watchlist
PUT /shows/:showId/preference
DELETE /shows/:showId/preference
PUT /shows/:showId/reflection
GET /shows/:showId/progress
GET /episodes/:episodeId
GET /episodes/:episodeId/cast
PUT /episodes/:episodeId/preference
DELETE /episodes/:episodeId/preference
PUT /episodes/:episodeId/reflection
POST /episodes/:episodeId/watches
DELETE /episodes/:episodeId/watches
GET /movies/:movieId
GET /movies/:movieId/cast
GET /movies/:movieId/watch-providers
POST /movies/:movieId/watches
DELETE /movies/:movieId/watches
POST /movies/:movieId/watchlist
DELETE /movies/:movieId/watchlist
PUT /movies/:movieId/preference
DELETE /movies/:movieId/preference
PUT /movies/:movieId/reflection
GET /library
GET /library/chronology
GET /recommendations
GET /discovery/available
GET /discovery/popular
GET /discovery/picks
GET /watch-paths
POST /watch-paths
POST /watch-paths/imports/tmdb-collection
GET /watch-paths/:pathId
POST /watch-paths/:pathId/watchlist
```

`GET /health` and `GET /health/db` expose release metadata from Vercel system
environment variables, including `release.commitSha`, `release.commitRef`,
`release.environment`, and `release.version`. `GET /health/db` verifies runtime
connectivity from Vercel to PostgreSQL. If Vercel has no `DATABASE_URL`, the API
fails during startup. `GET /health/error` exists only outside `NODE_ENV=production`
to validate the global error contract during development.
`GET /privacy`, `GET /terms`, `GET /support`, and `GET /account-deletion` are public release-readiness pages used by Profile links and store metadata.
`GET /users/me` validates a Supabase Auth bearer token, upserts the matching `UserIdentity`, and returns the real TVLore user. `PATCH /users/me` updates user-owned settings such as streaming availability country. `DELETE /users/me` deletes the authenticated user's TVLore data and Supabase Auth account.
`GET /search` validates a Supabase Auth bearer token and calls TMDB from the backend using server-side credentials.
`POST /catalog/resolve` validates a Supabase Auth bearer token, fetches TMDB details, and upserts an internal show or movie ID plus TMDB public rating metadata.
Show and movie detail endpoints read internal TVLore IDs. Show detail also
returns progress for episodes already persisted in TVLore. Season detail fetches
and persists TMDB episodes for the requested season. Episode detail reads one
persisted episode with show/season context. Cast endpoints read provider cast
metadata through the backend for the post-watch favorite-character picker. Watch endpoints store
per-user watched state, watchlist endpoints store saved intent, and
preference endpoints store user ratings. Library/progress endpoints read the
authenticated user's viewing state. Reflection endpoints store private
post-watch check-ins while updating the corresponding rating preference.

## Database

- Provider: Supabase Postgres.
- Project ref: `qpekdijebjzigrgcumpv`
- Project URL: `https://qpekdijebjzigrgcumpv.supabase.co`
- ORM: Prisma.
- Prisma schema: `apps/api/prisma/schema.prisma`
- Initial migration: `apps/api/prisma/migrations/20260810162500_init_user/migration.sql`
- Applied migrations: `20260810162500_init_user`, `20260810211300_add_auth_tables`, `20260811144000_add_catalog_tables`, `20260811151500_add_seasons_and_episodes`, `20260811165000_add_watch_tables`, `20260813220500_add_watchlist_tables`, `20260814101500_add_preferences`, `20260815172000_add_catalog_genres`, `20260815181000_add_user_availability_country`, `20260816102000_add_public_ratings`, `20260816110000_add_episode_preferences`, `20260816143000_add_user_watch_paths`, `20260816161000_add_watch_reflections`
- Current database tables: `_prisma_migrations`, `users`, `user_identities`, `refresh_sessions`, `shows`, `movies`, `seasons`, `episodes`, `external_identifiers`, `episode_watches`, `movie_watches`, `show_watchlist_items`, `movie_watchlist_items`, `show_preferences`, `movie_preferences`, `episode_preferences`, `show_reflections`, `movie_reflections`, `episode_reflections`, `user_watch_paths`, `user_watch_path_items`

Vercel environment variables:

```text
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

`DATABASE_URL` is used by the API at runtime. Use the Supabase Transaction Pooler:

```text
postgresql://postgres.qpekdijebjzigrgcumpv:YOUR_PASSWORD@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

`MIGRATE_DATABASE_URL` is used by Prisma migrations. Use the direct connection:

```text
postgresql://postgres:YOUR_PASSWORD@db.qpekdijebjzigrgcumpv.supabase.co:5432/postgres
```

Do not commit real database passwords.
`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are used by the API to validate
Supabase Auth access tokens.
`SUPABASE_SERVICE_ROLE_KEY` is used only by the API to call Supabase Admin
account deletion. It must be configured in Vercel Production and Preview before
the Profile delete-account action is considered release-ready.
`TMDB_ACCESS_TOKEN` is the TMDB API Read Access Token used by the backend catalog provider.
The rate-limit variables are optional tuning knobs. If omitted, the API uses
`180` general requests per `60` seconds and `40` provider-cost requests per
`60` seconds per client key.

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

Release smoke command:

```bash
corepack pnpm release:smoke
```

Use [Release Smoke Checklist](release-smoke-checklist.md) for the required
manual iPhone/Android QA matrix before beta builds.

For local verification, point the smoke test at the local API:

```powershell
$env:TVLORE_API_BASE_URL="http://localhost:3000"
corepack pnpm api:check
Remove-Item Env:\TVLORE_API_BASE_URL
```

The smoke test expects protected endpoints to return `401` without a token. To
also verify the authenticated product paths, set
`TVLORE_SUPABASE_ACCESS_TOKEN` to a real Supabase access token before running
`api:check`.

The API validates `DATABASE_URL` during Nest application startup. If the
variable is missing after loading local `.env`, the app fails to boot instead
of exposing partial routes with a broken database dependency.

## Mobile App

- App: `apps/mobile`
- Runtime: Expo SDK 54.
- Current API target for device testing: `https://tvlore-api.vercel.app`
- EAS profiles: `development`, `preview`, and `production` in `apps/mobile/eas.json`.
- Android package: `com.luiskabal.tvlore`.
- Google Play internal testing release: `6 (1.0.0)`, version code `6`.
- Supabase Auth client handles Google login and stores the mobile session.
- Supabase Auth client also supports native iOS Apple Sign-In when Apple/Supabase provider configuration is complete.
- Core product data should still go through the backend API, not direct table access from mobile.

Public mobile environment variables:

```text
EXPO_PUBLIC_TVLORE_API_BASE_URL=https://tvlore-api.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://qpekdijebjzigrgcumpv.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Local mobile setup uses `apps/mobile/.env` with the same keys as
`apps/mobile/.env.example`.

EAS cloud builds use project environment variables instead of local `.env`
files. Configure the same `EXPO_PUBLIC_*` keys for EAS `development`,
`preview`, and `production` before building remotely.

Local iPhone testing command:

```powershell
$env:EXPO_PUBLIC_TVLORE_API_BASE_URL="https://tvlore-api.vercel.app"
$env:EXPO_PUBLIC_SUPABASE_URL="https://qpekdijebjzigrgcumpv.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
corepack pnpm --filter @tvlore/mobile start -- --clear --port 8081
```

For OAuth testing with the installed development build, prefer:

```powershell
cd apps/mobile
corepack pnpm exec expo start --dev-client --clear --host lan --port 8081
```

Then open the LAN URL printed by Metro, currently:

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
Set `supabaseAccessToken` in the selected Postman environment to call protected
routes such as `GET /users/me`.

The collection also includes `Auth / Supabase` helpers for manual Google OAuth
testing. To use them, add this URL to Supabase Auth redirect URLs:

```text
https://oauth.pstmn.io/v1/callback
```

Then run `Auth / Supabase / Open Google OAuth URL`, complete Google login, and
copy the `access_token` and `refresh_token` from the callback URL fragment into
the selected Postman environment.

## Current Infra Checklist

- GitHub repository is connected.
- Vercel backend deploy is live.
- Mobile app can call the Vercel API from device builds.
- Mobile EAS build profiles are configured for development, preview, and production.
- Android internal testing is active in Google Play Console for `com.luiskabal.tvlore`.
- EAS production AAB version `6 (1.0.0)` has been uploaded to Google Play internal testing and installs through the tester flow.
- Supabase Google login works from an Expo development build.
- Mobile has the native iOS Apple Sign-In flow wired through Supabase `signInWithIdToken`; Apple Developer and Supabase Apple provider configuration are required before release-like testing.
- Prisma schema and initial migration exist.
- Vercel `tvlore-api` has database and Supabase Auth env vars configured.
- Vercel `tvlore-api` has `TMDB_ACCESS_TOKEN` configured for catalog search.
- `GET /health/db` returns `200` from production.
- Initial Prisma migration has been applied to Supabase.
- Auth identity/session tables have been applied to Supabase.
- `GET /users/me` resolves authenticated Supabase users into TVLore users.
- `DELETE /users/me` deletes user-owned TVLore data and the Supabase Auth user when `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Public legal/support pages are live at `/privacy`, `/terms`, `/support`, and `/account-deletion`.
- `GET /search` proxies TMDB search through the backend.
- `POST /catalog/resolve` persists provider-backed shows/movies into TVLore IDs with TMDB public ratings.
- Show/movie detail endpoints read catalog records by internal TVLore IDs.
- Season detail persists episode records for the requested season.
- Episode detail reads persisted episode records with show/season context.
- Watch/unwatch endpoints store authenticated movie and episode state.
- Watchlist endpoints store authenticated show/movie saved intent.
- Preference endpoints store authenticated show/movie/episode ratings.
- Reflection endpoints store private post-watch check-ins and keep the rating preference in sync.
- `GET /library` feeds the mobile home library summary.
- `GET /library/chronology` feeds the paginated Cronologia watch-history view.
- `GET /recommendations` feeds Search suggestion rows from stored ratings, hydrated catalog rows, genre names, user-country streaming availability, and the backend-owned TVLore score.
- `GET /discovery/available` feeds Search's country-aware available-to-stream titles from TMDB Discover and the user's saved availability country.
- `GET /discovery/popular` feeds Search's country-aware popular titles from TMDB Discover and the user's saved availability country.
- `GET /discovery/picks` feeds Search's TVLore-curated editorial picks from backend-owned TMDB refs.
- `GET /watch-paths`, `POST /watch-paths`, `POST /watch-paths/imports/tmdb-collection`, and `GET /watch-paths/:pathId` feed curated and user-owned viewing-order screens.
- `POST /watch-paths/:pathId/watchlist` saves a path into the authenticated user's watchlist using existing watchlist tables.
