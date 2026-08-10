# Mobile Architecture

TVLore mobile uses Expo Router, React Native, TypeScript, TanStack Query, Zustand, SecureStore, and AsyncStorage.

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

On launch:

1. Read refresh credential from SecureStore.
2. If absent, show auth flow.
3. If present, attempt `POST /auth/refresh`.
4. If refresh succeeds, store returned credentials and fetch `GET /users/me`.
5. If refresh fails, clear local credentials and show auth flow.

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

## Request Interceptors

The API client may:

- Attach access token to authenticated requests.
- Detect `401` caused by expiration.
- Attempt a single refresh.
- Replay the original request once if refresh succeeds.
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

