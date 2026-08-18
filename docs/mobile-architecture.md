# Mobile Architecture

TVLore mobile uses Expo Router, React Native, TypeScript, Supabase Auth, SecureStore, and AsyncStorage.

## Conceptual Expo Router Structure

```text
app/
|-- _layout.tsx
|-- index.tsx
|-- library.tsx
|-- picks.tsx
|-- recommendations.tsx
|-- search.tsx
|-- paths.tsx
|-- profile.tsx
|
|-- paths/
|   `-- [id].tsx
|
|-- shows/
|   |-- [id].tsx
|   `-- [id]/
|       `-- seasons/
|           `-- [seasonNumber].tsx
|
|-- movies/
|   `-- [id].tsx
|
`-- episodes/
    `-- [id].tsx
```

This structure is a starting point, not a permanent requirement.

## Navigation

- Root layout owns the stack shell and persistent primary tab bar.
- `/` redirects to `/library`.
- Library, Search, Paths, and Profile are primary user surfaces.
- Detail routes are stack screens above tabs and do not render the primary tab bar.
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
- `useMarkShowWatched()`
- `useMarkShowUnwatched()`
- `useAddToWatchlist()`
- `useRemoveFromWatchlist()`
- `useLibrary()`

Query hooks are client infrastructure. They must not implement backend business decisions.

Current decision: keep local hooks instead of adding a query library. The API
client owns only a small in-memory read cache for search and catalog detail
reads. Revisit TanStack Query if cache invalidation spreads beyond this simple
boundary.

## Current Implemented Layout

The mobile app now follows this smaller version of the target shape:

```text
app/
|-- _layout.tsx
|-- index.tsx
|-- search.tsx
|-- library.tsx
|-- paths.tsx
|-- profile.tsx
|-- paths/
|   `-- [id].tsx
|-- movies/
|   `-- [id].tsx
|-- episodes/
|   `-- [id].tsx
`-- shows/
    |-- [id].tsx
    `-- [id]/
        `-- seasons/
            `-- [seasonNumber].tsx

src/
|-- api/
|   |-- catalog.ts
|   |-- client.ts
|   |-- guards.ts
|   |-- home.ts
|   |-- preferences.ts
|   |-- reflections.ts
|   |-- tracking.ts
|   |-- tvlore-api.ts
|   |-- types.ts
|   |-- watch-paths.ts
|   `-- watchlist.ts
|
|-- auth/
|   |-- supabase-auth.ts
|   `-- use-auth-session.ts
|
|-- config/
|   `-- env.ts
|
|-- navigation/
|   |-- AppTabBar.tsx
|   `-- app-tab-bar-styles.ts
|
|-- catalog/
|   |-- CatalogDetailContent.tsx
|   |-- CatalogDetailScreen.tsx
|   |-- catalog-detail-styles.ts
|   |-- EpisodeDetailScreen.tsx
|   |-- episode-detail-styles.ts
|   |-- posters.ts
|   |-- SeasonContent.tsx
|   |-- SeasonDetailScreen.tsx
|   |-- season-detail-styles.ts
|   |-- watch-country.ts
|   |-- use-episode-detail.ts
|   |-- use-season-detail.ts
|   `-- use-catalog-detail.ts
|
|-- home/
|   |-- HoloProfileCard.tsx
|   |-- home-styles.ts
|   |-- HomeScreen.tsx
|   |-- LibraryOverview.tsx
|   |-- RecommendationsPanel.tsx
|   |-- use-recommendation-actions.ts
|   |-- use-home-model.ts
|   `-- use-home-data.ts
|
|-- library/
|   |-- LibraryScreen.tsx
|   |-- library-refresh.ts
|   `-- use-library-actions.ts
|
|-- profile/
|   `-- ProfileScreen.tsx
|
|-- watch-paths/
|   |-- WatchPathDetailScreen.tsx
|   |-- WatchPathsScreen.tsx
|   |-- use-watch-paths.ts
|   |-- watch-paths-model.ts
|   `-- watch-paths-styles.ts
|
|-- ui/
|   |-- AppText.tsx
|   |-- Badge.tsx
|   |-- Button.tsx
|   |-- MediaRow.tsx
|   |-- PosterImage.tsx
|   |-- Skeleton.tsx
|   |-- StatCard.tsx
|   |-- StillImage.tsx
|   |-- index.ts
|   `-- tokens.ts
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

Route screens render state and handle button wiring. `useHomeData` owns the
authenticated library loading flow. `src/api/tvlore-api.ts` is a compatibility
facade for screen and hook imports. The implementation is split by API
responsibility: `client.ts` owns HTTP helpers, `guards.ts` owns response-shape
validation, `types.ts` owns transport types, and the domain files own their
endpoint groups. `supabase-auth.ts` owns Supabase session and OAuth behavior.
`client.ts` also owns a short-lived read cache for catalog searches, movie/show
detail, and season detail. Cache entries are keyed by request path and a hash of
the auth header, are not persisted to AsyncStorage, and duplicate in-flight
reads share the same promise. User-state mutations clear the cache on login,
logout, and successful POST/PUT/DELETE calls. Catalog resolve calls do not clear
the read cache because they hydrate catalog identity and do not change the
user's library, watched state, watchlist, or rating preferences.

`LibraryScreen` and `ProfileScreen` consume shared authenticated backend state
through `useHomeModel`, but each screen opts into only the data it renders:

```text
LibraryScreen
  -> useHomeModel({ includeRecommendations: false })
  -> useHomeData()
  -> getSupabaseAccessToken()
  -> getHomeData(accessToken, { includeRecommendations: false })
  -> GET /users/me and GET /library in parallel
  -> useLibraryChronology()
  -> GET /library/chronology when Cronologia is visible

ProfileScreen
  -> useHomeModel({ includeRecommendations: false })
  -> useHomeData()
  -> getSupabaseAccessToken()
  -> getHomeData(accessToken, { includeRecommendations: false })
  -> GET /users/me and GET /library in parallel
  -> PATCH /users/me when availability country changes
  -> DELETE /users/me when delete account is confirmed
```

The mobile app does not call `GET /health` during normal product refreshes. Health
checks remain available for deployment and smoke checks, but product UI should
avoid extra roundtrips that do not change the user's screen.

`useHomeModel` refreshes this data when tracking, watchlist, or rating
mutations invalidate the library, so changes made in detail screens are
reflected when the user returns to Library or Profile.

The Library route renders `LibraryOverview`. The Profile route renders
`HoloProfileCard`. The card uses Supabase Google avatar metadata when available
and keeps the holo/tilt effect inside presentation code.

`src/ui` owns the first reusable visual pool: tokens, text, buttons, badges,
skeleton blocks, stat cards, poster frames, still-image frames, and media rows.
Library, Search, catalog detail, and season detail use this pool for repeated
visual patterns. These components are presentation-only. They do not fetch
data, resolve catalog IDs, calculate progress, or own domain-specific mutation
logic.

Search renders a `TVLore Picks` entry card. The editorial list lives in
`TvlorePicksScreen`. `useTvlorePicks` loads only `GET /discovery/picks`,
which returns backend-owned curated TMDB refs plus any existing TVLore IDs.
The screen reuses Search result rows and the same resolve flow as catalog
search, so unopened editorial titles become internal TVLore titles only when
the user taps them.

Search renders a `Recommended picks` entry card. The full recommendation list
lives in `RecommendationsScreen`, which reuses the presentation-only
`RecommendationsPanel`. `useSearchRecommendations` loads only
`GET /recommendations`; Library does not fetch recommendation data. The API
guard layer owns the response-shape validation. Recommendation rows receive
navigation callbacks from the route screen. Recommendation rows render
backend-provided genre names when available, but do not save to watchlist,
calculate suggestion quality, or render provider availability locally.
Availability and watchlist actions stay in detail screens.
`recommendation-detail.ts` owns the small presentation rule that turns
preferred-genre overlap into copy such as "Because you like Drama".

Search also renders a `Popular in your country` entry card. The full country
popular list lives in `PopularDiscoveryScreen`. `usePopularDiscovery` loads
only `GET /discovery/popular`, which returns search-shaped TMDB refs plus any
existing TVLore IDs. The screen reuses Search result rows and the same resolve
flow as catalog search, so unopened popular titles become internal TVLore
titles only when the user taps them.

Library rows receive navigation callbacks from `LibraryScreen`: movies route
to movie detail, watched episode show headings route to show detail,
continue-watching and season headings route to season detail, and watched
episode rows route to episode detail.
`useLibraryLookahead` warms the short-lived read cache for likely next taps:
watchlist/rated/recent movies and watched episode show headings use catalog
detail reads, while continuing shows and season headings use season detail
reads, and visible watched episode rows use episode detail reads.
`LibraryOverview` owns only local section-filter UI state for switching between
Cronologia, continuing shows, recently watched movies, watched episodes grouped
by show and season, watchlist, and rated titles. Summary stat cards reuse the
same filter state as the only section selector. Cronologia only renders the
chronological watch feed and asks for the next page when the user scrolls near
the end. `useLibraryChronology` keeps Supabase
token lookup, paging, and refresh invalidation out of `LibraryOverview`. Watched
episode season subsections keep their own local collapsed state. It also owns the swipe presentation
affordance for removable Library rows and compact poster thumbnail rendering
from existing API data.

Library row mutations flow through `useLibraryActions`, which keeps Supabase
token lookup and API calls out of `LibraryOverview`. The hook reuses existing
watchlist and tracking endpoints, then notifies the local library invalidator.
`LibraryOverview` confirms removable swipe rows in presentation code: first
swipe arms the row, tapping the revealed button or opening the same armed row
again confirms it. Confirmed actions apply optimistic row removal and restore
the row if the matching mutation reports an error.

`useHomeData` preserves the last ready snapshot during refreshes. Library and
Profile render skeletons only when no home data has loaded yet.

`HomeScreen` remains as a compatibility export to the Library route while `/`
redirects to `/library`. The primary product surfaces are now route-level
screens: Library, Search, Paths, and Profile.

`AppTabBar` is mounted once in `app/_layout.tsx`, not inside Library, Search, or
Profile screens. This keeps primary navigation stable while route content
changes underneath it.

Search and detail now follow the same boundary:

```text
SearchScreen
  -> useCatalogSearch()
  -> useTvlorePicks()
  -> useSearchRecommendations()
  -> usePopularDiscovery()
  -> GET /search
  -> GET /discovery/picks
  -> TvlorePicksScreen
  -> GET /recommendations
  -> RecommendationsScreen
  -> GET /discovery/popular
  -> PopularDiscoveryScreen
  -> POST /catalog/resolve
  -> router.push(/shows/:id or /movies/:id)
  -> CatalogDetailScreen
  -> useCatalogDetail()
  -> GET /shows/:id or GET /movies/:id
  -> GET /shows/:id/watch-providers or GET /movies/:id/watch-providers
  -> Show detail renders backend-owned progress state
  -> SeasonDetailScreen
  -> useSeasonDetail()
  -> GET /shows/:id/seasons/:seasonNumber
```

Watch Paths use the same boundary:

```text
WatchPathsScreen
  -> useWatchPaths()
  -> GET /watch-paths
  -> optional create form
  -> POST /watch-paths
  -> WatchPathDetailScreen
  -> useWatchPath(pathId)
  -> GET /watch-paths/:pathId
  -> render saved count and item saved state
  -> tap path item
  -> POST /catalog/resolve when the item has no TVLore ID yet
  -> router.push(/shows/:id or /movies/:id)
  -> optional Save all
  -> POST /watch-paths/:pathId/watchlist
  -> notify Library data changed
```

The app does not persist or rank paths locally. It renders backend-owned ordered
lists and per-user saved state. For personal paths, mobile parses simple import
lines into TMDB refs and sends them to `POST /watch-paths`; the backend hydrates
and persists the path. Catalog identity is resolved only when the user opens an
item or asks the backend to save the whole path to watchlist.
`useWatchPaths` prefetches the first few path details after loading the path
list. `useWatchPath` prefetches catalog detail reads for the first already
resolved path items. It does not prefetch unresolved path items because
`POST /catalog/resolve` can create catalog identity.

The app still does not calculate catalog identity, progress, or watched state.
It asks the backend, then renders the response. Detail screens also ask the
backend for watch-provider availability using the authenticated user's saved
country preference, falling back to the device country and then `CL` when
needed. Provider icons open the title-level TMDB/JustWatch availability link
returned by the backend.
For shows, detail progress is based on episodes already persisted by opening
season detail routes.

Mobile lookahead prefetch uses `src/catalog/prefetch.ts`:

- `GET /search` runs after a short debounce once the query has at least three characters.
- Repeated search/detail reads can reuse the API client's short-lived in-memory cache and in-flight request de-duplication.
- Changing the show/movie filter triggers an immediate request and clears stale results into skeleton rows.
- The Search button still forces an immediate request.
- Older in-flight search responses are ignored if a newer query starts first.
- Search prefetches detail reads for the first few visible results that already have TVLore IDs.
- Recommendation loading prefetches detail reads for the first few recommended titles.
- Library prefetches detail reads for likely visible title and season taps.
- Watch Paths prefetches the first few path details and already resolved path items.
- `POST /catalog/resolve` is still not bulk-prefetched because it writes catalog identity to the database.
- Initial search loading renders skeleton result rows.
- Typed-query refreshes keep previous results visible and show an updating indicator.

`SearchScreen` owns only route/container behavior: input state, selected filter,
debounce orchestration, resolve navigation, and hook wiring. `SearchControls`
owns the input/filter/button UI. `SearchResults` owns result states, skeletons,
and result rows. Shared visual pieces come from `src/ui`, while
`search-styles.ts` keeps only screen-specific layout and filter styling.

Movie tracking uses the same boundary:

```text
CatalogDetailScreen(movie)
  -> useCatalogDetail()
  -> POST /movies/:movieId/watches or DELETE /movies/:movieId/watches
  -> Optimistically update local watched state
  -> Reconcile local movie watched state from backend response
```

Show tracking uses the same boundary:

```text
CatalogDetailScreen(show)
  -> useCatalogDetail()
  -> POST /shows/:showId/watches or DELETE /shows/:showId/watches
  -> Reconcile local show progress from backend response
```

The app does not issue one request per episode for full-show actions. It sends
the user's intent once, and the backend hydrates seasons and recalculates
progress.

Season bulk tracking uses the same boundary:

```text
SeasonDetailScreen
  -> useSeasonDetail()
  -> POST /shows/:showId/seasons/:seasonNumber/watches or DELETE /shows/:showId/seasons/:seasonNumber/watches
  -> Reconcile local season rows and show progress from backend response
```

Episode tracking uses the same boundary:

```text
EpisodeDetailScreen
  -> useEpisodeDetail()
  -> POST /episodes/:episodeId/watches or DELETE /episodes/:episodeId/watches
  -> PUT /episodes/:episodeId/preference or DELETE /episodes/:episodeId/preference
  -> Optimistically update touched episode watched/rating state
  -> Display returned show progress
```

SeasonDetailScreen still mutates watched state for rows inside a season list.
Opening an episode route gives the episode the movie-like detail treatment:
watch/unwatch plus a per-episode 1-5 rating. The app still does not calculate
watched state. It renders the returned `watched`, `watchCount`,
`lastWatchedAt`, and `rating` values.

Watchlist uses the same boundary:

```text
CatalogDetailScreen(show/movie)
  -> useCatalogDetail()
  -> POST or DELETE /shows/:showId/watchlist
  -> POST or DELETE /movies/:movieId/watchlist
  -> Optimistically update local inWatchlist state
  -> Reconcile local inWatchlist state from backend response
```

The app does not infer saved intent from local lists. It may render optimistic
local state for reversible user actions, then settles on the `inWatchlist`
value returned by detail endpoints and watchlist mutations.

Post-watch check-in uses the same boundary:

```text
CatalogDetailScreen(movie/show) or EpisodeDetailScreen(episode)
  -> useCatalogDetail()
  -> mark watched succeeds
  -> router.push(/check-in?mediaType=...&id=...)
  -> PostWatchCheckInScreen loads the target detail
  -> GET /movies/:movieId/cast, GET /shows/:showId/cast, or GET /episodes/:episodeId/cast
  -> PUT /movies/:movieId/reflection
  -> PUT /shows/:showId/reflection
  -> PUT /episodes/:episodeId/reflection
```

`PostWatchCheckIn` is presentation-only. The `/check-in` route owns loading the
target detail, cast, and save action through the existing catalog or episode
hooks. The form builds a small draft for rating, sensation, favorite character,
and optional comment, then the screen hook sends that draft through the API
client. Cast is loaded lazily only after the check-in screen opens so detail
navigation stays fast; the chosen character is still persisted as the existing
reflection `favoriteCharacter` string. Manual character entry is a fallback for
unlisted cast, not the primary path. The backend persists the rating in the
existing preference model and stores the richer reflection separately. The flow
is skip-friendly: watched state is already saved before the check-in route opens.

Catalog and season detail routes render content-shaped skeletons while their
initial API requests are pending. This keeps detail screens visually stable
when Vercel, Supabase, or TMDB respond slowly.

After tracking or watchlist mutations, related detail screens update their local
response state immediately and notify the local library invalidator. Library and
Profile subscribe to that invalidator instead of receiving mutation callbacks
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
