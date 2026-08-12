# Mobile Architecture

TVLore mobile uses Expo Router, React Native, TypeScript, Supabase Auth, SecureStore, and AsyncStorage.

## Conceptual Expo Router Structure

```text
app/
|-- _layout.tsx
|
|-- (auth)/
|   `-- login.tsx
|
|-- (tabs)/
|   |-- index.tsx
|   |-- search.tsx
|   |-- library.tsx
|   `-- profile.tsx
|
|-- shows/
|   `-- [id].tsx
|
`-- movies/
    `-- [id].tsx
```

This structure is a starting point, not a permanent requirement.

## Navigation

- Root layout bootstraps providers and auth state.
- Auth routes contain login/onboarding.
- Tabs contain primary user surfaces.
- Detail routes are stack screens above tabs.
- Protected routes require an authenticated TVLore session.
- Deep links should route through backend validation where private data is involved.

## Authentication Bootstrap

Google OAuth must be tested in a development build or production build. Expo Go
does not provide TVLore's native `tvlore://` URL scheme, so it cannot reliably
receive the OAuth callback.

On launch:

1. Ask the Supabase client for the current session.
2. If absent, show the Google sign-in flow.
3. If present, call TVLore API with `Authorization: Bearer <supabase_access_token>`.
4. If backend auth fails, sign out locally and show the auth flow.

Avoid showing authenticated screens with stale identity assumptions.

## API Client Boundary

Do not scatter raw HTTP calls across components.

Use this flow:

```text
UI Screen
  -> Query Hook
  -> TVLore API Client
  -> HTTP
  -> NestJS
```

Example hooks:

- `useCurrentUser()`
- `useSearch(query)`
- `useResolveCatalogItem()`
- `useShow(id)`
- `useMovie(id)`
- `useSeason(showId, seasonNumber)`
- `useMarkEpisodeWatched()`
- `useMarkEpisodeUnwatched()`
- `useMarkMovieWatched()`
- `useMarkMovieUnwatched()`
- `useLibrary()`

Query hooks are client infrastructure. They must not implement backend business decisions.

## Current Implemented Layout

The first mobile screen now follows this smaller version of the target shape:

```text
app/
|-- _layout.tsx
|-- index.tsx
|-- search.tsx
|-- movies/
|   `-- [id].tsx
`-- shows/
    |-- [id].tsx
    `-- [id]/
        `-- seasons/
            `-- [seasonNumber].tsx

src/
|-- api/
|   `-- tvlore-api.ts
|
|-- auth/
|   |-- supabase-auth.ts
|   `-- use-auth-session.ts
|
|-- config/
|   `-- env.ts
|
|-- catalog/
|   |-- CatalogDetailContent.tsx
|   |-- CatalogDetailScreen.tsx
|   |-- catalog-detail-styles.ts
|   |-- posters.ts
|   |-- SeasonContent.tsx
|   |-- SeasonDetailScreen.tsx
|   |-- season-detail-styles.ts
|   |-- use-season-detail.ts
|   `-- use-catalog-detail.ts
|
|-- home/
|   |-- HoloProfileCard.tsx
|   |-- home-styles.ts
|   |-- HomeScreen.tsx
|   |-- LibraryOverview.tsx
|   `-- use-home-data.ts
|
`-- search/
    |-- SearchControls.tsx
    |-- SearchResults.tsx
    |-- SearchScreen.tsx
    |-- search-styles.ts
    `-- use-catalog-search.ts
```

The rule is:

```text
Screen -> hook -> API/auth client -> external system
```

`HomeScreen` renders state and handles button wiring. `useHomeData` owns the
home loading flow. `tvlore-api.ts` owns HTTP and response-shape validation.
`supabase-auth.ts` owns Supabase session and OAuth behavior.

The home screen now consumes real authenticated backend state:

```text
HomeScreen
  -> useHomeData()
  -> getSupabaseAccessToken()
  -> getHomeData(accessToken)
  -> GET /health
  -> GET /users/me
  -> GET /library
```

`HomeScreen` refreshes this data when navigation returns to `/` and when tracking
mutations invalidate the library, so watch changes made in movie or season detail
screens are reflected when the user returns to the profile.

The home library summary is rendered through `LibraryOverview` and
`HoloProfileCard`. The card uses Supabase Google avatar metadata when available
and keeps the holo/tilt effect inside presentation code.

Home library rows receive navigation callbacks from `HomeScreen`: movies route
to movie detail and episode/show rows route to season detail.

`useHomeData` preserves the last ready snapshot during refreshes. `HomeScreen`
renders skeletons only when no home data has loaded yet.

This is still intentionally a small first slice. The product screens will later
move into Expo Router routes such as Search, Detail, Library, and Profile, but
the current implementation already proves that mobile can render backend-owned
library data using the Supabase session.

Search and detail now follow the same boundary:

```text
SearchScreen
  -> useCatalogSearch()
  -> GET /search
  -> POST /catalog/resolve
  -> router.push(/shows/:id or /movies/:id)
  -> CatalogDetailScreen
  -> useCatalogDetail()
  -> GET /shows/:id or GET /movies/:id
  -> SeasonDetailScreen
  -> useSeasonDetail()
  -> GET /shows/:id/seasons/:seasonNumber
```

The app still does not calculate catalog identity, progress, or watched state.
It asks the backend, then renders the response.

Search uses client-side prefetch:

- `GET /search` runs after a short debounce once the query has at least three characters.
- Changing the show/movie filter triggers an immediate request and clears stale results into skeleton rows.
- The Search button still forces an immediate request.
- Older in-flight search responses are ignored if a newer query starts first.
- `POST /catalog/resolve` is never prefetched because it writes catalog identity to the database.
- Initial search loading renders skeleton result rows.
- Typed-query refreshes keep previous results visible and show an updating indicator.

`SearchScreen` owns only route/container behavior: input state, selected filter,
debounce orchestration, resolve navigation, and hook wiring. `SearchControls`
owns the input/filter/button UI. `SearchResults` owns result states, skeletons,
and result rows. `search-styles.ts` owns the styling.

Movie tracking uses the same boundary:

```text
CatalogDetailScreen(movie)
  -> useCatalogDetail()
  -> POST /movies/:movieId/watches or DELETE /movies/:movieId/watches
  -> Update local movie watched state from backend response
```

Episode tracking uses the same boundary:

```text
SeasonDetailScreen
  -> useSeasonDetail()
  -> POST /episodes/:episodeId/watches or DELETE /episodes/:episodeId/watches
  -> Update touched episode watched state from backend response
  -> Display returned show progress
```

The app still does not calculate watched state. It renders the returned
`watched`, `watchCount`, and `lastWatchedAt` values.

After tracking mutations, related detail screens update their local response
state immediately and notify the local library invalidator. The home/profile
screen subscribes to that invalidator instead of receiving mutation callbacks
from child routes.

## Request Interceptors

The API client may:

- Attach the Supabase access token to authenticated requests.
- Let the Supabase client refresh its session.
- Clear credentials and redirect to login if refresh fails.

Avoid infinite refresh loops.

## Loading States

Every server-state screen should handle:

- Initial loading.
- Background refetch.
- Empty state.
- Recoverable error.
- Auth expired.
- Provider unavailable where relevant.

## Mutations

Mutation hooks may:

- Submit API requests.
- Manage pending state.
- Invalidate related queries.
- Apply conservative optimistic UI only when rollback is clear.
- Translate API error codes into UX copy.

They must not:

- Decide whether the watch is allowed.
- Calculate progress.
- Decide ownership.
- Infer privacy permissions.

## App Lifecycle

Use app lifecycle events to support:

- Foreground refetch of stale queries.
- Token refresh before protected calls.
- Clearing transient UI state when appropriate.

Do not implement offline-first synchronization in MVP.

## Offline Expectations

MVP offline behavior:

- Show cached TanStack Query data where available.
- Disable or queue nothing for watched/unwatched mutations.
- Present clear retry affordances.
- Revalidate when the app returns online.

Offline-first mutation sync is out of scope.
