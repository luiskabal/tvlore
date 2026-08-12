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
- Season-level mark all watched/unwatched.
- Library summary with watched show, movie, and episode counts.
- Holographic mobile profile summary card with Google avatar and library stats.
- Continue-watching and recently-watched data from the backend.
- Library rows navigate back into movie and show season detail screens.
- Profile/home keeps prior data during refresh and shows skeletons on first load.
- Mobile home, search, and detail screens follow a route/container, hook, presentation, and styles split.
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
-> Mark all season episodes watched
-> Return to profile
-> Library summary auto-refreshes
```

## Verification

```powershell
corepack pnpm verify
```

Use `corepack pnpm verify:full` before larger merges or release-oriented changes.
Use `corepack pnpm api:check` for local/Vercel HTTP smoke checks.

## Next Backlog Items

- Promote the temporary home into routed Library/Profile surfaces.
- Add detail-screen skeletons for show, movie, and season routes.

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
