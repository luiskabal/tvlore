# TVLore

TVLore is a mobile-first entertainment tracking application for shows, seasons, episodes, and movies.

The architecture baseline lives in [docs/README.md](docs/README.md).
The current infrastructure setup lives in [docs/infrastructure.md](docs/infrastructure.md).

## Current Status

- Monorepo is initialized with API, mobile, shared contracts, and documentation.
- Backend API is deployed on Vercel at `https://tvlore-api.vercel.app`.
- Supabase Postgres is connected through Prisma; production DB connectivity and migrations are verified.
- Google OAuth is configured through Supabase Auth and works from the Expo development build.
- Expo mobile app can consume the deployed API from iPhone.

## Current Features

- Google sign-in with Supabase Auth.
- Authenticated `GET /users/me` backed by TVLore user records.
- API health and database health endpoints.
- TMDB-backed search for shows and movies.
- Catalog resolve from TMDB refs into internal TVLore IDs.
- Show and movie detail screens in mobile.
- Season detail screen with backend-owned episode IDs.
- Movie watched/unwatched tracking.
- Episode watched/unwatched tracking.
- Library summary with watched show, movie, and episode counts.
- Continue-watching and recently-watched data from the backend.
- Postman collection and API smoke checks for local/Vercel validation.

## Current MVP Flow

```text
Google login
-> Search catalog
-> Open show or movie
-> Resolve catalog item
-> Mark movie watched
-> Open show season
-> Mark episode watched
-> Refresh library summary
```

## Verification

```powershell
corepack pnpm verify
```

Use `corepack pnpm verify:full` before larger merges or release-oriented changes.
Use `corepack pnpm api:check` for local/Vercel HTTP smoke checks.

## Next Backlog Items

- Season-level `Mark all watched` / `Mark all unwatched`.
- Mobile code cleanup: split route/container logic, presentational components, and styles.
- Auto-refresh library after returning from tracking screens.
- Promote the temporary home into routed Library/Profile surfaces.

## Workspace Layout

```text
apps/
  api/
  mobile/
packages/
  contracts/
docs/
```

## Useful Docs

- [Current State](docs/current-state.md)
- [Backlog](docs/backlog.md)
- [Mobile Architecture](docs/mobile-architecture.md)
- [Backend Architecture](docs/backend-architecture.md)
- [Infrastructure](docs/infrastructure.md)
