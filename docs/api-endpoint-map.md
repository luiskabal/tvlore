# API Endpoint Map

This is the day-to-day route map for TVLore's REST API. Use it when wiring
Postman, the mobile API facade, smoke checks, or a new backend feature.

For full request/response examples and validation details, see
[API Design](api-design.md).

## Contract Rules

- Production base URL: `https://tvlore-api.vercel.app`.
- Product endpoints require `Authorization: Bearer <supabase_access_token>`.
- Supabase Auth owns login, session refresh, and logout.
- TVLore API validates the Supabase bearer token, resolves the TVLore user, and
  owns product data.
- Mobile must not send `userId` for user-scoped operations.
- Mobile must not write directly to Supabase tables.
- TMDB IDs are provider refs. TVLore UUIDs are product identity.
- `GET /search` returns provider refs. `POST /catalog/resolve` turns one ref
  into an internal TVLore show or movie ID.
- Backend errors use the shared error shape: `code`, `message`, `details`,
  `correlationId`.
- Rate limiting is global. Provider-cost routes have a separate stricter
  profile.

## Public Runtime And Store Routes

These routes are intentionally public.

| Method | Path | Purpose | Source |
| --- | --- | --- | --- |
| `GET` | `/` | Basic API presence check. | `root.controller.ts` |
| `GET` | `/health` | API health and release metadata. | `health.controller.ts` |
| `GET` | `/health/db` | Database connectivity health check. | `health.controller.ts` |
| `GET` | `/health/error` | Local-only error probe; returns `404` in production. | `health.controller.ts` |
| `GET` | `/privacy` | Public privacy policy page for stores. | `legal.controller.ts` |
| `GET` | `/terms` | Public terms page for stores. | `legal.controller.ts` |
| `GET` | `/support` | Public support page for stores. | `legal.controller.ts` |
| `GET` | `/account-deletion` | Public account deletion instructions for stores. | `legal.controller.ts` |

## Authenticated Product Routes

Every route below requires a Supabase access token.

### User

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Resolve the authenticated Supabase user into a TVLore user. | `users.ts` |
| `PATCH` | `/users/me` | Update profile settings such as `availabilityCountry`. | `users.ts` |
| `GET` | `/users/me/account-deletion` | Check whether backend deletion is configured. | `users.ts` |
| `DELETE` | `/users/me` | Delete TVLore user data and Supabase Auth user when configured. | `users.ts` |

### Catalog Search And Resolve

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/search?query=&types=&page=` | Search TMDB-backed shows and movies. | `catalog.ts` |
| `POST` | `/catalog/resolve` | Convert a TMDB ref into a TVLore show/movie UUID. | `catalog.ts` |

Typical resolve body:

```json
{
  "mediaType": "show",
  "provider": "tmdb",
  "providerId": "70523"
}
```

### Catalog Details

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/shows/:showId` | Show detail, progress, watchlist, rating, reflection, public rating. | `catalog.ts` |
| `GET` | `/shows/:showId/seasons` | Season summaries for a show. | `catalog.ts` |
| `GET` | `/shows/:showId/seasons/:seasonNumber` | Season detail and paged episodes. | `catalog.ts` |
| `GET` | `/episodes/:episodeId` | Episode detail with show/season context and user state. | `catalog.ts` |
| `GET` | `/movies/:movieId` | Movie detail, watch state, watchlist, rating, reflection, public rating. | `catalog.ts` |

Season detail supports progressive loading:

| Query | Meaning |
| --- | --- |
| `hydrate=true/false` | Whether to call the provider to fill missing season data. |
| `episodeLimit=1..50` | Page size for episodes. |
| `episodeOffset=0..n` | Episode page offset. |

### Cast And Availability

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/shows/:showId/cast` | Cast list for favorite-character selection. | `catalog.ts` |
| `GET` | `/movies/:movieId/cast` | Cast list for favorite-character selection. | `catalog.ts` |
| `GET` | `/episodes/:episodeId/cast` | Episode cast list for favorite-character selection. | `catalog.ts` |
| `GET` | `/shows/:showId/watch-providers?country=CL` | Where-to-watch providers for a show. | `catalog.ts` |
| `GET` | `/movies/:movieId/watch-providers?country=CL` | Where-to-watch providers for a movie. | `catalog.ts` |

Cast and watch providers are intentionally separate from detail payloads so
title navigation can stay fast and load secondary information only when needed.

### Tracking

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `POST` | `/episodes/:episodeId/watches` | Mark one episode watched. | `tracking.ts` |
| `DELETE` | `/episodes/:episodeId/watches` | Mark one episode unwatched. | `tracking.ts` |
| `POST` | `/movies/:movieId/watches` | Mark one movie watched. | `tracking.ts` |
| `DELETE` | `/movies/:movieId/watches` | Mark one movie unwatched. | `tracking.ts` |
| `POST` | `/shows/:showId/watches` | Mark a full show watched through backend bulk tracking. | `tracking.ts` |
| `DELETE` | `/shows/:showId/watches` | Mark a full show unwatched. | `tracking.ts` |
| `POST` | `/shows/:showId/seasons/:seasonNumber/watches` | Mark a full season watched. | `tracking.ts` |
| `DELETE` | `/shows/:showId/seasons/:seasonNumber/watches` | Mark a full season unwatched. | `tracking.ts` |

Watch mutation body is optional. Mobile currently sends an ISO timestamp:

```json
{
  "watchedAt": "2026-08-21T00:00:00.000Z"
}
```

### Watchlist

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `POST` | `/shows/:showId/watchlist` | Save a show for later. | `watchlist.ts` |
| `DELETE` | `/shows/:showId/watchlist` | Remove a show from watchlist. | `watchlist.ts` |
| `POST` | `/movies/:movieId/watchlist` | Save a movie for later. | `watchlist.ts` |
| `DELETE` | `/movies/:movieId/watchlist` | Remove a movie from watchlist. | `watchlist.ts` |

### Ratings

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `PUT` | `/shows/:showId/preference` | Set a 1-5 show rating. | `preferences.ts` |
| `DELETE` | `/shows/:showId/preference` | Clear a show rating. | `preferences.ts` |
| `PUT` | `/movies/:movieId/preference` | Set a 1-5 movie rating. | `preferences.ts` |
| `DELETE` | `/movies/:movieId/preference` | Clear a movie rating. | `preferences.ts` |
| `PUT` | `/episodes/:episodeId/preference` | Set a 1-5 episode rating. | `preferences.ts` |
| `DELETE` | `/episodes/:episodeId/preference` | Clear an episode rating. | `preferences.ts` |

Rating body:

```json
{
  "rating": 5
}
```

### Post-Watch Reflections

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `PUT` | `/shows/:showId/reflection` | Save show rating, emotion, favorite character, and comment. | `reflections.ts` |
| `PUT` | `/movies/:movieId/reflection` | Save movie rating, emotion, favorite character, and comment. | `reflections.ts` |
| `PUT` | `/episodes/:episodeId/reflection` | Save episode rating, emotion, favorite character, and comment. | `reflections.ts` |

Reflection body:

```json
{
  "rating": 5,
  "reaction": "loved",
  "favoriteCharacter": "Jonas",
  "comment": "Optional private note"
}
```

Supported `reaction` values: `loved`, `liked`, `mixed`, `not_for_me`.

### Library And Progress

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/library` | Summary, continue watching, watchlist, rated titles, recent activity. | `home.ts` |
| `GET` | `/library/chronology?limit=&cursor=` | Paginated chronological watch history. | `library.ts` |
| `GET` | `/shows/:showId/progress` | Backend-calculated show progress. | `tracking.ts` |

Cronologia uses cursor pagination. Use the previous response `nextCursor` to
load the next page.

### Recommendations And Discovery

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/recommendations` | TVLore-scored recommendations from user taste signals. | `recommendations.ts` |
| `GET` | `/discovery/picks` | Backend-owned editorial picks. | `discovery.ts` |
| `GET` | `/discovery/available` | Country-aware available-to-stream discovery. | `discovery.ts` |
| `GET` | `/discovery/popular` | Country-aware popular discovery. | `discovery.ts` |

`/recommendations` is personalized from TVLore data. `/discovery/*` uses
country/provider context and returns search-like rows that can be resolved.

### Watch Paths

| Method | Path | Purpose | Mobile API |
| --- | --- | --- | --- |
| `GET` | `/watch-paths` | List curated and user-owned viewing paths. | `watch-paths.ts` |
| `GET` | `/watch-paths/:pathId` | Read one path and item watchlist state. | `watch-paths.ts` |
| `POST` | `/watch-paths` | Create a personal path from ordered TMDB refs. | `watch-paths.ts` |
| `POST` | `/watch-paths/imports/tmdb-collection` | Import a personal path from a TMDB Collection URL. | `watch-paths.ts` |
| `POST` | `/watch-paths/:pathId/watchlist` | Save all path items to the user's watchlist. | `watch-paths.ts` |

Manual path body:

```json
{
  "title": "Nolan Batman",
  "description": "The Dark Knight trilogy in release order.",
  "items": [
    {
      "mediaType": "movie",
      "note": "Start here",
      "externalRef": {
        "provider": "tmdb",
        "providerId": "272"
      }
    }
  ]
}
```

TMDB collection import body:

```json
{
  "url": "https://www.themoviedb.org/collection/10-star-wars-collection"
}
```

## Mobile API Facade

The mobile app imports API calls through `apps/mobile/src/api/tvlore-api.ts`.
That file exports domain modules:

| Module | Responsibility |
| --- | --- |
| `client.ts` | Base URL, JSON parsing, error extraction, auth headers, short-lived read cache. |
| `users.ts` | Current user, country preference, deletion readiness, delete account. |
| `home.ts` | Parallel fetch for user, library, and optional recommendations. |
| `catalog.ts` | Search, resolve, details, season pages, episode detail, cast, watch providers. |
| `tracking.ts` | Episode/movie/show/season watched mutations and show progress shape. |
| `watchlist.ts` | Show/movie watchlist mutations. |
| `preferences.ts` | Show/movie/episode rating mutations. |
| `reflections.ts` | Post-watch check-in persistence. |
| `library.ts` | Paginated Cronologia. |
| `recommendations.ts` | Personalized TVLore recommendations. |
| `discovery.ts` | Picks, available, popular discovery shelves. |
| `watch-paths.ts` | Curated/user paths, imports, bulk watchlist save. |

Read calls that can be safely reused use `fetchCachedJson`. Mutations use
`fetchMutationJson`, which clears the in-memory read cache after success.

## Rate Limit Groups

The global rate-limit guard keys requests by bearer token when present and by
IP otherwise.

Provider-cost routes use the stricter provider profile because they can call
TMDB or hydrate provider-backed data:

- `GET /search`
- `POST /catalog/resolve`
- `GET /recommendations`
- `GET /discovery/popular`
- `GET /discovery/available`
- any `*/cast`
- any `*/watch-providers`
- `GET /shows/:showId/seasons/:seasonNumber`
- `POST /watch-paths`
- `POST /watch-paths/imports/tmdb-collection`
- `POST /watch-paths/:pathId/watchlist`

## Verification

Public API smoke:

```powershell
corepack pnpm api:check
```

Authenticated smoke:

```powershell
$env:TVLORE_SUPABASE_ACCESS_TOKEN="<supabase_access_token>"
corepack pnpm api:check
```

When adding or changing an endpoint, update:

1. Backend controller, service, repository/provider as needed.
2. Full endpoint spec in [API Design](api-design.md).
3. This endpoint map.
4. Mobile API facade in `apps/mobile/src/api`.
5. Mobile runtime guard in `apps/mobile/src/api/guards.ts`.
6. Postman collection in `tools/postman`.
7. Smoke coverage in `tools/check-api.mjs` if the route is release-critical.
8. Unit tests for parser/service/repository behavior.

## Common Debugging Paths

- `401 UNAUTHORIZED`: refresh the Supabase access token and confirm the
  `Authorization: Bearer ...` header has no escaped underscores or markdown
  formatting.
- `400 VALIDATION_FAILED`: check route UUIDs, `rating` range, `watchedAt` ISO
  datetime format, country code, or path import URL.
- `404 NOT_FOUND`: provider refs must be resolved before using internal detail,
  tracking, rating, or watchlist routes.
- Slow season open: use `hydrate=false` and `episodeLimit` for a fast shell,
  then progressively fetch pages.
- Stale mobile screen: successful mutations clear API read cache, but route
  focus refresh still needs to run when navigating back.
