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
- Show detail progress state: not started, watching, or completed.
- Show-level mark all watched/unwatched backed by the API.
- Season-level mark all watched/unwatched.
- Personal show/movie watchlist.
- Personal show/movie rating preferences.
- Library summary with watched show, movie, episode, watchlist, and rated-title counts.
- Segmented Library views for watching, watchlist, rated titles, and history.
- Holographic mobile profile summary card with Google avatar and library stats.
- Continue-watching and recently-watched data from the backend.
- Rated show/movie list from the backend.
- First-pass recommendations from stored rating preferences and hydrated catalog data.
- Recommendation rows can be saved directly to the watchlist with optimistic feedback.
- Library recommendations and rows navigate back into movie and show detail screens.
- Library/Profile keeps prior data during refresh and shows skeletons on first load.
- Routed Library, Search, and Profile mobile surfaces with bottom app navigation.
- Detail screens render content-shaped skeletons while show, movie, or season data loads.
- Mobile library, profile, search, and detail screens follow a route/container, hook, presentation, and styles split.
- Mobile API calls are grouped behind a stable `tvlore-api.ts` facade with domain modules for catalog, home, tracking, watchlist, and preferences.
- Postman collection and API smoke checks for local/Vercel validation.

## Current MVP Flow

```text
Google login
-> Search catalog
-> Open show or movie
-> Resolve catalog item
-> Save show or movie to watchlist
-> Rate show or movie
-> Mark movie watched
-> Open show season
-> Mark episode watched
-> Mark all season episodes watched
-> Mark full show watched
-> Return to profile
-> Library summary auto-refreshes
-> Switch between Library, Search, and Profile
```

## Verification

```powershell
corepack pnpm verify
```

Use `corepack pnpm verify:full` before larger merges or release-oriented changes.
Use `corepack pnpm api:check` for local/Vercel HTTP smoke checks.

## Next Backlog Items

- Refine recommendation quality after storing richer catalog signals such as genres or providers.

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
