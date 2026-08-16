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
- Authenticated `GET /users/me` and `PATCH /users/me` backed by TVLore user records.
- API health and database health endpoints.
- TMDB-backed search for shows and movies.
- Catalog resolve from TMDB refs into internal TVLore IDs.
- Show and movie detail screens in mobile.
- Season detail screen with backend-owned episode IDs.
- Movie watched/unwatched tracking.
- Episode watched/unwatched tracking.
- Episode detail screens opened from season episode rows.
- Show detail progress state: not started, watching, or completed.
- Country-aware `Where to watch` provider icons on show/movie detail using the user's saved country preference and TMDB Watch Providers.
- Curated Watch Paths with backend-owned ordered viewing lists, including Marvel Infinity Saga and Star Wars Skywalker Saga.
- Curated Watch Paths can be saved to the user's watchlist in one backend-owned action.
- Curated Watch Path detail shows saved count and saved row state for the authenticated user.
- Show-level mark all watched/unwatched backed by the API.
- Season-level mark all watched/unwatched.
- Personal show/movie watchlist.
- Personal show/movie rating preferences.
- Compact show/movie rating comparison in detail screens: TMDB public rating versus the user's 1-5 rating, with the public rating hidden as `Spoiler` until the user rates it or manually reveals it.
- Optional post-watch rating check-in after marking a movie or full show watched.
- Library summary with watched show, movie, episode, watchlist, and rated-title counts.
- Tappable Library summary cards filter Cronologia, watching shows, movies, grouped episodes, watchlist, and rated titles.
- Cronologia loads backend-paginated watched movie and episode history and fetches more as the user scrolls.
- Grouped episode seasons can be expanded or collapsed with a tap.
- Holographic mobile profile summary card with Google avatar and library stats.
- Profile country selector for streaming availability, rendered with flag labels.
- Continue-watching and recently-watched data from the backend.
- Rated show/movie list from the backend.
- First-pass recommendations from stored rating preferences, hydrated catalog data, persisted genre names, and user-country streaming availability.
- Recommendation rows explain genre matches when the user's rated-title genres overlap with a suggested title.
- Recommendation rows open title detail; watchlist actions stay on the detail screen.
- Search combines catalog search with a `Recommended picks` entry, which opens a dedicated recommendations list.
- Library/Profile keeps prior data during refresh and shows skeletons on first load.
- Routed Library, Search, Paths, and Profile mobile surfaces with bottom app navigation.
- Detail screens render content-shaped skeletons while show, movie, or season data loads.
- Mobile caches search and catalog detail reads briefly in memory, then clears that cache on login, logout, and successful mutations.
- Mobile uses lookahead prefetch for Search, recommendations, Library, and Watch Paths to reduce perceived navigation latency.
- Mobile library, profile, search, and detail screens follow a route/container, hook, presentation, and styles split.
- Mobile has an initial reusable UI pool for tokens, text, buttons, badges, skeletons, stat cards, posters, still images, and media rows, already used by Library, Search, catalog detail, and season detail surfaces.
- Mobile API calls are grouped behind a stable `tvlore-api.ts` facade with domain modules for catalog, home, tracking, watchlist, and preferences.
- Mobile has initial Vitest coverage for pure search and chronology logic.
- Postman collection and API smoke checks for local/Vercel validation.

## Current MVP Flow

```text
Google login
-> Search catalog
-> Open show or movie
-> Resolve catalog item
-> Open curated Watch Path
-> Resolve a path item on tap
-> Save a full Watch Path to watchlist
-> Save show or movie to watchlist
-> Rate show or movie
-> Mark movie watched
-> Optional post-watch rating check-in
-> Open show season
-> Mark episode watched
-> Mark all season episodes watched
-> Mark full show watched
-> Return to profile
-> Library summary auto-refreshes
-> Switch between Library, Search, Paths, and Profile
```

## Verification

```powershell
corepack pnpm verify
```

Use `corepack pnpm verify:full` before larger merges or release-oriented changes.
Use `corepack pnpm api:check` for local/Vercel HTTP smoke checks.

## Next Backlog Items

- Refine recommendation quality with stronger taste signals after the provider/country baseline.
- Add user-owned imported watch paths after approving persistence/schema shape.

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
