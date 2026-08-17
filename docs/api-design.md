# API Design

TVLore starts with a REST API. REST is sufficient for the MVP's resource shape, works well for mobile clients, and keeps the backend easy to debug.

All protected endpoints derive the authenticated user from the access token. Clients must not send `userId` for user-scoped operations.

## Common Response Conventions

- JSON request and response bodies.
- ISO 8601 timestamps.
- UUIDs for TVLore IDs.
- Consistent error contract from [Error Handling](error-handling.md).
- Backend-owned authorization and business validation.

## Resource Naming Decisions

Search begins with provider-backed results, but watch history must reference TVLore IDs. Therefore, search results may include external refs and optional existing TVLore IDs. A selected result is resolved with `POST /catalog/resolve`, which creates or updates internal entities and returns a TVLore ID.

This avoids using TMDB IDs as permanent API identity.

## MVP Endpoints

Google login, refresh, and logout are handled by Supabase Auth for the MVP.
TVLore protected endpoints receive the Supabase access token through:

```http
Authorization: Bearer <supabase_access_token>
```

### `GET /health`

Purpose: health check for local development, deployment, and smoke tests.

Auth: none.

Route parameters: none.

Query parameters: none.

Request: none.

Response:

```json
{
  "status": "ok",
  "service": "tvlore-api",
  "time": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `503 SERVICE_UNAVAILABLE` if dependency health is included later and fails

Authorization: none.

Transport validation: none.

Business validation: none.

Errors: `SERVICE_UNAVAILABLE`.

### Deferred `POST /auth/google`

Purpose: authenticate using a Google credential and create or resolve a TVLore user if TVLore-owned auth is introduced later.

Current MVP status: not implemented. Supabase Auth handles Google login.

Auth: none.

Route parameters: none.

Query parameters: none.

Request:

```json
{
  "idToken": "google-id-token",
  "deviceLabel": "Luis iPhone"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "displayName": "Luis",
    "createdAt": "2026-08-09T00:00:00.000Z"
  },
  "accessToken": "short-lived-access-token",
  "refreshToken": "opaque-refresh-token",
  "expiresIn": 900
}
```

Status codes:

- `200 OK` for existing user
- `201 CREATED` for first TVLore user creation
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `429 TOO_MANY_REQUESTS`

Authorization: backend verifies the Google credential and resolves `UserIdentity`.

Transport validation:

- `idToken` required string.
- `deviceLabel` optional string length limit.

Business validation:

- Google token signature, issuer, audience, and expiration are valid.
- Provider subject is resolved.
- UserIdentity is unique per provider subject.

Errors: `INVALID_GOOGLE_CREDENTIAL`, `AUTH_RATE_LIMITED`, `VALIDATION_FAILED`, `UNEXPECTED_ERROR`.

### Deferred `POST /auth/refresh`

Purpose: exchange a valid refresh token for a new access token and optionally a rotated refresh token if TVLore-owned auth is introduced later.

Current MVP status: not implemented. Supabase Auth handles refresh.

Auth: refresh token body credential.

Route parameters: none.

Query parameters: none.

Request:

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

Response:

```json
{
  "accessToken": "short-lived-access-token",
  "refreshToken": "new-opaque-refresh-token",
  "expiresIn": 900
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `429 TOO_MANY_REQUESTS`

Authorization: refresh session must be active, unexpired, and not revoked.

Transport validation:

- `refreshToken` required string.

Business validation:

- Token hash matches an active refresh session.
- Session belongs to a known user.
- Token is not expired or revoked.
- Rotation/reuse policy is enforced.

Errors: `INVALID_REFRESH_TOKEN`, `REFRESH_SESSION_REVOKED`, `REFRESH_TOKEN_EXPIRED`, `AUTH_RATE_LIMITED`.

### Deferred `POST /auth/logout`

Purpose: revoke the current refresh session if TVLore-owned auth is introduced later.

Current MVP status: not implemented. Supabase Auth handles sign-out.

Auth: required.

Route parameters: none.

Query parameters: none.

Request:

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

Response:

```json
{
  "success": true
}
```

Status codes:

- `200 OK`
- `204 NO_CONTENT` if response body is omitted
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`

Authorization: access token identifies user; refresh token must belong to that user if provided.

Transport validation:

- `refreshToken` required unless implementation revokes by session claim.

Business validation:

- Refresh session is revoked idempotently.

Errors: `INVALID_REFRESH_TOKEN`, `UNAUTHORIZED`, `VALIDATION_FAILED`.

### `GET /users/me`

Purpose: return the authenticated TVLore user.

Auth: required.

Route parameters: none.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "uuid",
  "displayName": "Luis",
  "availabilityCountry": "CL",
  "createdAt": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `401 UNAUTHORIZED`

Authorization: Supabase access token must represent an active Supabase Auth user.

Transport validation: none.

Business validation:

- Supabase token resolves to a user.
- `UserIdentity(provider = "supabase", providerSubject = Supabase user ID)` is found or created.
- TVLore `User` is found or created.

Errors: `UNAUTHORIZED`, `USER_NOT_FOUND`.

### `PATCH /users/me`

Purpose: update authenticated TVLore user settings.

Current MVP status: implemented for the user's streaming availability country.

Auth: required.

Route parameters: none.

Query parameters: none.

Request:

```json
{
  "availabilityCountry": "CL"
}
```

Response:

```json
{
  "id": "uuid",
  "displayName": "Luis",
  "availabilityCountry": "CL",
  "createdAt": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`

Authorization: Supabase access token must represent an active Supabase Auth user.

Transport validation:

- `availabilityCountry` is required.
- `availabilityCountry` must be a two-letter ISO country code. Values are normalized to uppercase.

Business validation:

- The authenticated user's TVLore user row is found or created before settings are updated.
- The preference is user-owned and is later used by mobile for watch-provider lookups.

Errors: `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /users/me`

Purpose: permanently delete the authenticated user's TVLore account.

Current MVP status: implemented for API-owned user data and Supabase Auth user deletion.

Auth: required.

Route parameters: none.

Query parameters: none.

Request: none.

Response:

```json
{
  "deleted": true
}
```

Status codes:

- `200 OK`
- `401 UNAUTHORIZED`
- `502 BAD_GATEWAY`
- `503 SERVICE_UNAVAILABLE`

Authorization: Supabase access token must represent an active Supabase Auth user.

Business behavior:

- Deletes the matching TVLore `User` if it exists.
- User-owned rows cascade through the database: identities, refresh sessions, watched episodes/movies, watchlist items, ratings, reflections, and personal watch paths.
- Shared catalog rows are kept.
- Deletes the Supabase Auth user through the Supabase Admin API.
- If the TVLore user is already gone but the Supabase token still resolves, the endpoint still attempts Supabase Auth deletion.

Errors: `UNAUTHORIZED`, `ACCOUNT_DELETION_NOT_CONFIGURED`, `ACCOUNT_DELETION_FAILED`.

### `GET /search`

Purpose: search TV shows and movies through the backend catalog provider boundary.

Current MVP status: implemented for provider-backed search results and existing TVLore ID lookup.

Auth: required.

Route parameters: none.

Query parameters:

- `query` required string.
- `types` optional comma-separated `show,movie`.
- `page` optional positive integer between 1 and 500.

Request: none.

Response:

```json
{
  "query": "dark",
  "page": 1,
  "results": [
    {
      "mediaType": "show",
      "title": "Dark",
      "year": 2017,
      "overview": "A family saga with a supernatural twist.",
      "posterPath": "/path.jpg",
      "externalRef": {
        "provider": "tmdb",
        "providerId": "70523"
      },
      "tvloreId": null
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `429 TOO_MANY_REQUESTS`
- `502 BAD_GATEWAY`
- `503 SERVICE_UNAVAILABLE`

Authorization: authenticated users may search catalog content.

Transport validation:

- Query string length and required presence.
- Type enum validation.
- Page positive integer validation.

Business validation:

- Provider requests are rate-limited.
- Provider errors are mapped to TVLore errors.

Errors: `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`, `CATALOG_RATE_LIMITED`.

### `POST /catalog/resolve`

Purpose: resolve a provider-backed search result into an internal TVLore show or movie ID.

Current MVP status: implemented for TMDB shows and movies.

Auth: required.

Route parameters: none.

Query parameters: none.

Request:

```json
{
  "mediaType": "show",
  "provider": "tmdb",
  "providerId": "70523"
}
```

Response:

```json
{
  "mediaType": "show",
  "id": "uuid"
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `502 BAD_GATEWAY`

Authorization: authenticated users may resolve catalog records.

Transport validation:

- `mediaType` enum.
- `provider` enum.
- `providerId` required string.

Business validation:

- Provider item exists.
- Internal record and external identifier are upserted consistently.
- TMDB response maps to the requested media type.

Errors: `CATALOG_ITEM_NOT_FOUND`, `CATALOG_PROVIDER_UNAVAILABLE`, `VALIDATION_FAILED`.

### `GET /shows/:showId`

Purpose: return TVLore show details by internal ID.

Current MVP status: implemented with authenticated user's progress, watchlist state, rating preference, reflection, and TMDB public rating.

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "uuid",
  "title": "Dark",
  "overview": "A family saga with a supernatural twist.",
  "posterPath": "/path.jpg",
  "firstAirDate": "2017-12-01",
  "inWatchlist": true,
  "publicRating": 8.4,
  "rating": 5,
  "reflection": {
    "reaction": "loved",
    "favoriteCharacter": "Jonas",
    "comment": "Dense, but worth it.",
    "updatedAt": "2026-08-16T00:00:00.000Z"
  },
  "seasons": [
    {
      "id": "uuid",
      "seasonNumber": 1,
      "title": "Season 1",
      "episodeCount": 10
    }
  ],
  "progress": {
    "showId": "uuid",
    "watchedEpisodeCount": 3,
    "totalEpisodeCount": 10,
    "percentComplete": 30,
    "status": "watching",
    "isComplete": false,
    "nextEpisode": {
      "id": "uuid",
      "seasonNumber": 1,
      "episodeNumber": 4,
      "title": "Double Lives"
    },
    "seasons": []
  }
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated users may read catalog details.

Transport validation:

- `showId` UUID.

Business validation:

- Show exists.
- Provider refresh may occur if metadata is stale.
- Progress, watchlist state, rating preference, and reflection are calculated for authenticated user.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`.

### `GET /shows/:showId/seasons`

Purpose: list seasons for a show.

Current MVP status: implemented from internal TVLore season records.

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "showId": "uuid",
  "seasons": [
    {
      "id": "uuid",
      "seasonNumber": 1,
      "title": "Season 1",
      "episodeCount": 10
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated users may read catalog details.

Transport validation:

- `showId` UUID.

Business validation:

- Show exists.
- Season metadata may be refreshed from provider if missing/stale.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`.

### `GET /shows/:showId/seasons/:seasonNumber`

Purpose: return a season and its episodes, including authenticated user's watch state.

Current MVP status: implemented with authenticated user's watched state.

Auth: required.

Route parameters:

- `showId` UUID.
- `seasonNumber` integer.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "uuid",
  "showId": "uuid",
  "showTitle": "Dark",
  "seasonNumber": 1,
  "title": "Season 1",
  "episodes": [
    {
      "id": "uuid",
      "episodeNumber": 1,
      "title": "Secrets",
      "airDate": "2017-12-01",
      "watched": true,
      "watchCount": 1,
      "lastWatchedAt": "2026-08-09T00:00:00.000Z"
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: watch state is only for the authenticated user.

Transport validation:

- `showId` UUID.
- `seasonNumber` non-negative integer.

Business validation:

- Show exists.
- Season belongs to show.
- Episodes are returned with backend-calculated watch state.

Errors: `SHOW_NOT_FOUND`, `SEASON_NOT_FOUND`, `VALIDATION_FAILED`.

### `GET /episodes/:episodeId`

Purpose: return one persisted episode with show/season context and the authenticated user's watch state.

Current MVP status: implemented from internal TVLore episode records, including authenticated user's rating preference and reflection.

Auth: required.

Route parameters:

- `episodeId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "uuid",
  "showId": "uuid",
  "showTitle": "Dark",
  "showPosterPath": "/poster.jpg",
  "seasonId": "uuid",
  "seasonTitle": "Season 1",
  "seasonNumber": 1,
  "episodeNumber": 1,
  "title": "Secrets",
  "overview": "A first episode.",
  "stillPath": "/still.jpg",
  "airDate": "2017-12-01",
  "runtimeMinutes": 52,
  "rating": 4,
  "reflection": {
    "reaction": "liked",
    "favoriteCharacter": "Jonas",
    "comment": null,
    "updatedAt": "2026-08-16T00:00:00.000Z"
  },
  "watched": true,
  "watchCount": 1,
  "lastWatchedAt": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: watch state is only for the authenticated user.

Transport validation:

- `episodeId` UUID.

Business validation:

- Episode exists.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`.

### `PUT /episodes/:episodeId/preference`

Purpose: set a 1-5 rating preference for an episode for the authenticated user.

Auth: required.

Route parameters:

- `episodeId` UUID.

Request:

```json
{
  "rating": 4
}
```

Response:

```json
{
  "id": "uuid",
  "mediaType": "episode",
  "rating": 4,
  "updatedAt": "2026-08-16T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Validation: `rating` must be an integer from 1 to 5. Repeated calls update the same user/episode preference row.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /episodes/:episodeId/preference`

Purpose: clear an episode rating preference for the authenticated user.

Auth: required.

Route parameters:

- `episodeId` UUID.

Response:

```json
{
  "id": "uuid",
  "mediaType": "episode",
  "rating": null,
  "updatedAt": null
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `GET /movies/:movieId`

Purpose: return movie details and authenticated user's watch state, watchlist state, and rating preference.

Current MVP status: implemented with authenticated user's watched state, watchlist state, rating preference, reflection, and TMDB public rating.

Auth: required.

Route parameters:

- `movieId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "uuid",
  "title": "Arrival",
  "overview": "A linguist works with the military to communicate with alien lifeforms.",
  "posterPath": "/path.jpg",
  "releaseDate": "2016-11-11",
  "runtimeMinutes": 116,
  "inWatchlist": true,
  "publicRating": 7.9,
  "rating": 4,
  "reflection": {
    "reaction": "loved",
    "favoriteCharacter": null,
    "comment": "Great pacing.",
    "updatedAt": "2026-08-16T00:00:00.000Z"
  },
  "watched": true,
  "watchCount": 1,
  "lastWatchedAt": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: watch state is only for the authenticated user.

Transport validation:

- `movieId` UUID.

Business validation:

- Movie exists.
- Provider refresh may occur if metadata is stale.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`.

### `GET /shows/:showId/cast`, `GET /movies/:movieId/cast`, `GET /episodes/:episodeId/cast`

Purpose: return a normalized cast list for the authenticated post-watch check-in favorite-character picker.

Current MVP status: implemented through TMDB-backed provider calls. Cast is intentionally not embedded in show/movie/episode detail responses so detail navigation can stay fast.

Auth: required.

Route parameters:

- `showId` UUID for show cast.
- `movieId` UUID for movie cast.
- `episodeId` UUID for episode cast.

Query parameters: none.

Request: none.

Response:

```json
{
  "items": [
    {
      "id": "tmdb-person-id",
      "actorName": "Louis Hofmann",
      "characterName": "Jonas Kahnwald",
      "profilePath": "/profile.jpg",
      "order": 0
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated users may read cast metadata for resolved catalog items.

Transport validation:

- Route ID must be a UUID.

Business validation:

- The referenced TVLore show, movie, or episode must exist.
- The backend resolves the related TMDB provider ID before calling TMDB.
- Episode cast combines episode `credits.cast`, episode guest stars, and top-level guest stars when TMDB provides them.

Errors: `SHOW_NOT_FOUND`, `MOVIE_NOT_FOUND`, `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`.

### `PUT /shows/:showId/preference`

Purpose: set a 1-5 rating preference for a show for the authenticated user.

Auth: required.

Route parameters:

- `showId` UUID.

Request:

```json
{
  "rating": 5
}
```

Response:

```json
{
  "id": "uuid",
  "mediaType": "show",
  "rating": 5,
  "updatedAt": "2026-08-14T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Validation: `rating` must be an integer from 1 to 5. Repeated calls update the same user/show preference row.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /shows/:showId/preference`

Purpose: clear a show rating preference for the authenticated user.

Auth: required.

Route parameters:

- `showId` UUID.

Response:

```json
{
  "id": "uuid",
  "mediaType": "show",
  "rating": null,
  "updatedAt": null
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `PUT /movies/:movieId/preference`

Purpose: set a 1-5 rating preference for a movie for the authenticated user.

Auth: required.

Route parameters:

- `movieId` UUID.

Request:

```json
{
  "rating": 4
}
```

Response:

```json
{
  "id": "uuid",
  "mediaType": "movie",
  "rating": 4,
  "updatedAt": "2026-08-14T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Validation: `rating` must be an integer from 1 to 5. Repeated calls update the same user/movie preference row.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /movies/:movieId/preference`

Purpose: clear a movie rating preference for the authenticated user.

Auth: required.

Route parameters:

- `movieId` UUID.

Response:

```json
{
  "id": "uuid",
  "mediaType": "movie",
  "rating": null,
  "updatedAt": null
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `PUT /shows/:showId/reflection`

Purpose: save a private post-watch check-in for a show and update the matching show rating preference.

Auth: required.

Route parameters:

- `showId` UUID.

Request:

```json
{
  "rating": 5,
  "reaction": "loved",
  "favoriteCharacter": "Jonas",
  "comment": "Dense, but worth it."
}
```

Response:

```json
{
  "id": "uuid",
  "mediaType": "show",
  "rating": 5,
  "reaction": "loved",
  "favoriteCharacter": "Jonas",
  "comment": "Dense, but worth it.",
  "updatedAt": "2026-08-16T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Validation: `rating` must be an integer from 1 to 5. `reaction` must be one of `loved`, `liked`, `mixed`, or `not_for_me`. `favoriteCharacter` may be null or up to 80 characters. `comment` may be null or up to 500 characters. Empty optional strings are normalized to null.

Business behavior: repeated calls update the same user/show reflection row and the same user/show rating preference row.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `PUT /movies/:movieId/reflection`

Purpose: save a private post-watch check-in for a movie and update the matching movie rating preference.

Auth: required.

Route parameters:

- `movieId` UUID.

Request and validation: same body shape and validation as `PUT /shows/:showId/reflection`.

Response:

```json
{
  "id": "uuid",
  "mediaType": "movie",
  "rating": 4,
  "reaction": "liked",
  "favoriteCharacter": null,
  "comment": "Great pacing.",
  "updatedAt": "2026-08-16T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Business behavior: repeated calls update the same user/movie reflection row and the same user/movie rating preference row.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `PUT /episodes/:episodeId/reflection`

Purpose: save a private post-watch check-in for an episode and update the matching episode rating preference.

Auth: required.

Route parameters:

- `episodeId` UUID.

Request and validation: same body shape and validation as `PUT /shows/:showId/reflection`.

Response:

```json
{
  "id": "uuid",
  "mediaType": "episode",
  "rating": 4,
  "reaction": "mixed",
  "favoriteCharacter": "Martha",
  "comment": null,
  "updatedAt": "2026-08-16T00:00:00.000Z"
}
```

Status codes: `200 OK`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Business behavior: repeated calls update the same user/episode reflection row and the same user/episode rating preference row. The endpoint does not mark the episode watched; mobile saves watched state first, then opens the optional check-in.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `POST /episodes/:episodeId/watches`

Purpose: mark an episode watched for the authenticated user.

Auth: required.

Route parameters:

- `episodeId` UUID.

Query parameters: none.

Request:

```json
{
  "watchedAt": "2026-08-09T00:00:00.000Z"
}
```

`watchedAt` is optional. If omitted, the backend uses server time.

Response:

```json
{
  "episodeId": "uuid",
  "watched": true,
  "watchCount": 1,
  "lastWatchedAt": "2026-08-09T00:00:00.000Z",
  "showProgress": {
    "isComplete": false,
    "nextEpisode": {
      "id": "uuid",
      "seasonNumber": 1,
      "episodeNumber": 2,
      "title": "Episode 2"
    },
    "showId": "uuid",
    "status": "watching",
    "seasons": [
      {
        "seasonNumber": 1,
        "watchedEpisodeCount": 1,
        "totalEpisodeCount": 10,
        "percentComplete": 10
      }
    ],
    "watchedEpisodeCount": 1,
    "totalEpisodeCount": 10,
    "percentComplete": 10
  }
}
```

Status codes:

- `200 OK` if already watched and endpoint is idempotent
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only create their own watch record.

Transport validation:

- `episodeId` UUID.
- `watchedAt` ISO datetime if present.

Business validation:

- Episode exists.
- Mark watched is idempotent: one active watch row per user/episode in the MVP.
- Progress is recalculated server-side.
- Show progress is calculated from episodes currently persisted in TVLore, which means it becomes more complete as seasons are opened and hydrated.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /episodes/:episodeId/watches`

Purpose: mark an episode unwatched for the authenticated user.

Auth: required.

Route parameters:

- `episodeId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "episodeId": "uuid",
  "watched": false,
  "watchCount": 0,
  "lastWatchedAt": null,
  "showProgress": {
    "isComplete": false,
    "nextEpisode": {
      "id": "uuid",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "Episode 1"
    },
    "showId": "uuid",
    "status": "not_started",
    "seasons": [
      {
        "seasonNumber": 1,
        "watchedEpisodeCount": 0,
        "totalEpisodeCount": 10,
        "percentComplete": 0
      }
    ],
    "watchedEpisodeCount": 0,
    "totalEpisodeCount": 10,
    "percentComplete": 0
  }
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own watch records.

Transport validation:

- `episodeId` UUID.

Business validation:

- Episode exists.
- The MVP watch row for that user/episode is removed.
- Progress is recalculated server-side.
- Show progress is calculated from episodes currently persisted in TVLore.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `POST /shows/:showId/watches`

Purpose: mark every episode in a show watched for the authenticated user.

Current MVP status: implemented as a backend-owned bulk action. The backend hydrates every provider-backed season before writing episode watch rows.

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters: none.

Request:

```json
{
  "watchedAt": "2026-08-09T00:00:00.000Z"
}
```

`watchedAt` is optional. If omitted, the backend uses server time.

Response: `ShowProgressResponse`.

Status codes:

- `200 OK` if already watched and endpoint is idempotent
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `502 BAD_GATEWAY`

Authorization: authenticated user may only create their own episode watch records.

Transport validation:

- `showId` UUID.
- `watchedAt` ISO datetime if present.

Business validation:

- Show exists.
- Backend resolves the show's catalog provider ID.
- Backend hydrates all non-empty seasons before writing watches.
- One active watch row per user/episode is upserted.
- Progress is recalculated server-side from persisted episode rows.

Errors: `SHOW_NOT_FOUND`, `CATALOG_PROVIDER_UNAVAILABLE`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /shows/:showId/watches`

Purpose: mark every episode in a show unwatched for the authenticated user.

Current MVP status: implemented as a backend-owned bulk action.

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters: none.

Request: none.

Response: `ShowProgressResponse`.

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own episode watch records.

Transport validation:

- `showId` UUID.

Business validation:

- Show exists.
- All authenticated user's episode watch rows for that show are removed.
- Progress is recalculated server-side from persisted episode rows.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `POST /shows/:showId/seasons/:seasonNumber/watches`

Purpose: mark every episode in a single show season watched for the authenticated user.

Current MVP status: implemented as a backend-owned bulk action. The backend hydrates the selected provider-backed season before writing episode watch rows.

Auth: required.

Route parameters:

- `showId` UUID.
- `seasonNumber` non-negative integer.

Query parameters: none.

Request:

```json
{
  "watchedAt": "2026-08-09T00:00:00.000Z"
}
```

`watchedAt` is optional. If omitted, the backend uses server time.

Response: `ShowProgressResponse`.

Status codes:

- `200 OK` if already watched and endpoint is idempotent
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `502 BAD_GATEWAY`

Authorization: authenticated user may only create their own episode watch records.

Transport validation:

- `showId` UUID.
- `seasonNumber` non-negative integer.
- `watchedAt` ISO datetime if present.

Business validation:

- Show exists.
- Backend resolves the show's catalog provider ID.
- Backend hydrates the requested season before writing watches.
- One active watch row per user/episode in that season is upserted.
- Progress is recalculated server-side from persisted episode rows.

Errors: `SHOW_NOT_FOUND`, `SEASON_NOT_FOUND`, `CATALOG_PROVIDER_UNAVAILABLE`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /shows/:showId/seasons/:seasonNumber/watches`

Purpose: mark every episode in a single show season unwatched for the authenticated user.

Current MVP status: implemented as a backend-owned bulk action.

Auth: required.

Route parameters:

- `showId` UUID.
- `seasonNumber` non-negative integer.

Query parameters: none.

Request: none.

Response: `ShowProgressResponse`.

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own episode watch records.

Transport validation:

- `showId` UUID.
- `seasonNumber` non-negative integer.

Business validation:

- Season exists for that show.
- All authenticated user's episode watch rows for that season are removed.
- Progress is recalculated server-side from persisted episode rows.

Errors: `SEASON_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `POST /movies/:movieId/watches`

Purpose: mark a movie watched for the authenticated user.

Auth: required.

Route parameters:

- `movieId` UUID.

Query parameters: none.

Request:

```json
{
  "watchedAt": "2026-08-09T00:00:00.000Z"
}
```

Response:

```json
{
  "movieId": "uuid",
  "watched": true,
  "watchCount": 1,
  "lastWatchedAt": "2026-08-09T00:00:00.000Z"
}
```

Status codes:

- `200 OK` if already watched and endpoint is idempotent
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only create their own watch record.

Transport validation:

- `movieId` UUID.
- `watchedAt` ISO datetime if present.

Business validation:

- Movie exists.
- Mark watched is idempotent: one active watch row per user/movie in the MVP.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `DELETE /movies/:movieId/watches`

Purpose: mark a movie unwatched for the authenticated user.

Auth: required.

Route parameters:

- `movieId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "movieId": "uuid",
  "watched": false,
  "watchCount": 0,
  "lastWatchedAt": null
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own watch records.

Transport validation:

- `movieId` UUID.

Business validation:

- Movie exists.
- The MVP watch row for that user/movie is removed.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `GET /shows/:showId/progress`

Purpose: return backend-calculated show and season progress for authenticated user.

Current MVP status: implemented. Progress is calculated from episodes currently persisted in TVLore, so opening more seasons gives the backend more episode rows to count.

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters: none.

Request: none.

Response:

```json
{
  "showId": "uuid",
  "watchedEpisodeCount": 7,
  "totalEpisodeCount": 10,
  "percentComplete": 70,
  "isComplete": false,
  "nextEpisode": {
    "id": "uuid",
    "seasonNumber": 1,
    "episodeNumber": 8,
    "title": "As You Sow, So You Shall Reap"
  },
  "seasons": [
    {
      "seasonNumber": 1,
      "watchedEpisodeCount": 7,
      "totalEpisodeCount": 10,
      "percentComplete": 70
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: progress is only for the authenticated user.

Transport validation:

- `showId` UUID.

Business validation:

- Show exists.
- Episode eligibility rules are applied by backend.
- Progress is calculated from TVLore-owned watch records.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`.

### `GET /library`

Purpose: return personal library/profile summary for authenticated user.

Current MVP status: implemented with summary, continue-watching shows, rated titles, watchlist titles, recent movie/episode activity, and complete watched episode activity.

Auth: required.

Route parameters: none.

Query parameters:

- None in the MVP.

Future query parameters:

- `section` optional enum: `all`, `continueWatching`, `shows`, `movies`.
- `page` optional positive integer.

Request: none.

Response:

```json
{
  "summary": {
    "watchedShowCount": 12,
    "watchedMovieCount": 34,
    "watchedEpisodeCount": 183,
    "watchlistItemCount": 8,
    "ratedTitleCount": 6,
    "averageRating": 4.2
  },
  "continueWatching": [
    {
      "mediaType": "show",
      "id": "uuid",
      "title": "Severance",
      "posterPath": "/path.jpg",
      "percentComplete": 44,
      "nextEpisode": {
        "id": "uuid",
        "seasonNumber": 1,
        "episodeNumber": 5,
        "title": "The Grim Barbarity of Optics and Design"
      }
    }
  ],
  "ratedTitles": [
    {
      "mediaType": "movie",
      "id": "uuid",
      "title": "Arrival",
      "posterPath": "/path.jpg",
      "rating": 5,
      "updatedAt": "2026-08-09T00:00:00.000Z"
    },
    {
      "mediaType": "show",
      "id": "uuid",
      "title": "Dark",
      "posterPath": "/path.jpg",
      "rating": 4,
      "updatedAt": "2026-08-09T00:00:00.000Z"
    }
  ],
  "recentlyWatched": [
    {
      "mediaType": "movie",
      "id": "uuid",
      "title": "Arrival",
      "posterPath": "/path.jpg",
      "watchedAt": "2026-08-09T00:00:00.000Z"
    },
    {
      "mediaType": "episode",
      "id": "uuid",
      "showId": "uuid",
      "showTitle": "Dark",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "Secrets",
      "watchedAt": "2026-08-09T00:00:00.000Z"
    }
  ],
  "watchlist": [
    {
      "mediaType": "show",
      "id": "uuid",
      "title": "Severance",
      "posterPath": "/path.jpg",
      "createdAt": "2026-08-09T00:00:00.000Z"
    }
  ],
  "watchedEpisodes": [
    {
      "mediaType": "episode",
      "id": "uuid",
      "showId": "uuid",
      "showTitle": "Dark",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "Secrets",
      "watchedAt": "2026-08-09T00:00:00.000Z"
    }
  ]
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`

Authorization: library is only for the authenticated user.

Transport validation: none in the MVP.

Business validation:

- Summary and progress are calculated by backend.
- Results include only authenticated user's data.
- Ratings are explicit preferences and are returned separately from watched history.
- `recentlyWatched` is a short chronological feed; `watchedEpisodes` is the complete watched episode list for structured episode views.

Errors: `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `GET /library/chronology`

Purpose: return a paginated chronological watch-history feed for authenticated user.

Current MVP status: implemented with movie and episode watch events ordered by `watchedAt` descending.

Auth: required.

Route parameters: none.

Query parameters:

- `limit` optional integer between `1` and `50`. Defaults to `20`.
- `cursor` optional ISO datetime. Use the previous response `nextCursor` to load the next page.

Request: none.

Response:

```json
{
  "items": [
    {
      "mediaType": "movie",
      "id": "uuid",
      "title": "Arrival",
      "posterPath": "/path.jpg",
      "watchedAt": "2026-08-09T00:00:00.000Z"
    },
    {
      "mediaType": "episode",
      "id": "uuid",
      "showId": "uuid",
      "showTitle": "Dark",
      "seasonNumber": 1,
      "episodeNumber": 1,
      "title": "Secrets",
      "watchedAt": "2026-08-08T00:00:00.000Z"
    }
  ],
  "nextCursor": "2026-08-08T00:00:00.000Z"
}
```

Status codes:

- `200 OK`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`

Authorization: chronology is only for the authenticated user.

Transport validation:

- `limit` must be inside the supported page-size range.
- `cursor` must be parseable as an ISO datetime.

Business validation:

- Results include only authenticated user's watch records.
- Movies and episodes are merged into one backend-owned chronological feed.

Errors: `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `GET /recommendations`

Purpose: return first-pass personalized suggestions for the authenticated user.

Current MVP status: implemented with stored rating preferences, hydrated catalog rows, persisted genre names, and a streaming-availability boost for the user's saved country.

Auth: required.

Route parameters: none.

Query parameters: none in the MVP.

Request: none.

Response:

```json
{
  "basis": {
    "averageShowRating": 4.5,
    "averageMovieRating": 3.8,
    "availabilityCountry": "CL",
    "preferredGenreNames": ["Drama", "Mystery"],
    "ratedTitleCount": 8
  },
  "items": [
    {
      "mediaType": "show",
      "genreNames": ["Drama", "Sci-Fi"],
      "id": "uuid",
      "title": "Severance",
      "overview": "Mark leads a team...",
      "posterPath": "/path.jpg",
      "reason": "based_on_show_ratings"
    },
    {
      "mediaType": "movie",
      "genreNames": ["Drama"],
      "id": "uuid",
      "title": "Arrival",
      "overview": "Taking place after alien crafts land...",
      "posterPath": "/path.jpg",
      "reason": "based_on_movie_ratings"
    }
  ]
}
```

Status codes:

- `200 OK`
- `401 UNAUTHORIZED`

Authorization: recommendations are only for the authenticated user.

Business validation:

- The endpoint excludes titles the user has already rated, watched, or saved to watchlist.
- The first heuristic prioritizes the media type with the user's higher average rating.
- Highly rated titles contribute preferred genre names, and candidates sharing those genres are ordered first.
- Within each media type, titles available to stream in the user's saved availability country are ranked before titles without subscription-streaming availability.
- Results are limited to catalog rows already persisted in TVLore; the endpoint only calls TMDB Watch Providers for the final candidate set.
- The response does not expose provider buckets; visible availability remains in show/movie detail through the dedicated watch-provider endpoints.
- If the user has no rating preferences yet, `items` is empty.

Errors: `UNAUTHORIZED`.

### `GET /discovery/popular`

Purpose: return country-aware popular shows and movies for the authenticated user.

Current MVP status: implemented with TMDB Discover, using the authenticated user's saved availability country as `watch_region`.

Auth: required.

Route parameters: none.

Query parameters: none in the MVP.

Request: none.

Response:

```json
{
  "country": "CL",
  "section": "popular_in_country",
  "items": [
    {
      "externalRef": {
        "provider": "tmdb",
        "providerId": "70523"
      },
      "mediaType": "show",
      "overview": "A missing child sets four families...",
      "posterPath": "/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg",
      "title": "Dark",
      "tvloreId": "uuid-or-null",
      "year": 2017
    }
  ]
}
```

Status codes:

- `200 OK`
- `401 UNAUTHORIZED`

Authorization: popular discovery is personalized only by the authenticated user's saved country.

Business validation:

- The endpoint asks TMDB Discover for popular shows and movies, scoped by the user's saved availability country.
- The response uses the same search-result row shape as `GET /search`, so mobile can resolve unopened TMDB refs through `POST /catalog/resolve`.
- Existing TVLore IDs are hydrated when the TMDB item was already resolved before.
- Personalized ranking remains in `GET /recommendations`; this endpoint is contextual discovery, not a taste model.

Errors: `UNAUTHORIZED`.

### `GET /watch-paths`

Purpose: return backend-owned curated and personal viewing paths for the authenticated user.

Current MVP status: implemented with static curated paths and user-owned persisted paths.

Auth: required.

Route parameters: none.

Query parameters: none.

Request: none.

Response:

```json
{
  "paths": [
    {
      "id": "mcu-infinity-saga-release",
      "title": "Marvel Infinity Saga",
      "description": "MCU Phase 1-3 in theatrical release order.",
      "itemCount": 23,
      "source": "curated"
    }
  ]
}
```

Status codes: `200 OK`, `401 UNAUTHORIZED`.

Authorization: curated paths are shared. User paths are returned only for the authenticated owner.

Business validation:

- The backend owns the curated path definitions.
- The backend owns user path persistence.
- Mobile does not sort or mutate path definitions locally.

Errors: `UNAUTHORIZED`.

### `POST /watch-paths`

Purpose: create a user-owned viewing path from ordered TMDB refs.

Current MVP status: implemented with simple manual import input.

Auth: required.

Request:

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

Response: same shape as `GET /watch-paths/:pathId`.

Status codes: `201 CREATED`, `400 BAD_REQUEST`, `401 UNAUTHORIZED`.

Authorization: created paths belong to the authenticated user.

Business validation:

- `title` is required.
- At least one item is required.
- Items must use `mediaType` `show` or `movie`.
- Items currently support TMDB refs only.
- The backend hydrates missing title, poster, and year before persisting the path.

Errors: `BAD_REQUEST`, `UNAUTHORIZED`.

### `GET /watch-paths/:pathId`

Purpose: return one curated or user-owned viewing path with ordered provider-backed items.

Current MVP status: implemented for curated paths and authenticated user-owned paths.

Auth: required.

Route parameters:

- `pathId` string.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "mcu-infinity-saga-release",
  "title": "Marvel Infinity Saga",
  "description": "MCU Phase 1-3 in theatrical release order.",
  "itemCount": 23,
  "source": "curated",
  "savedItemCount": 1,
  "items": [
    {
      "id": "mcu-infinity-saga-release-1",
      "position": 1,
      "mediaType": "movie",
      "inWatchlist": true,
      "title": "Iron Man",
      "year": 2008,
      "note": "Phase 1",
      "posterPath": "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
      "externalRef": {
        "provider": "tmdb",
        "providerId": "1726"
      },
      "tvloreId": null
    }
  ]
}
```

Status codes: `200 OK`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Authorization: authenticated users may read curated paths. User-owned paths are readable only by the owner.

Business validation:

- Unknown path IDs and user paths owned by another user return `WATCH_PATH_NOT_FOUND`.
- `tvloreId` is populated only when TVLore already has a resolved catalog row for the item's provider ref.
- `savedItemCount` and each item's `inWatchlist` are calculated for the authenticated user from existing watchlist rows.
- If `tvloreId` is null, the client opens the item by calling `POST /catalog/resolve` with the item's TMDB ref.

Errors: `WATCH_PATH_NOT_FOUND`, `UNAUTHORIZED`.

### `POST /watch-paths/:pathId/watchlist`

Purpose: resolve every item in a path and save each show or movie to the authenticated user's watchlist.

Current MVP status: implemented for curated and user-owned backend-owned paths.

Auth: required.

Route parameters:

- `pathId` string.

Query parameters: none.

Request: none.

Response:

```json
{
  "id": "star-wars-skywalker-release",
  "title": "Star Wars Skywalker Saga",
  "itemCount": 9,
  "savedItemCount": 9
}
```

Status codes: `200 OK`, `401 UNAUTHORIZED`, `404 NOT_FOUND`.

Authorization: authenticated users may save curated paths and their own user-owned paths to their own watchlist.

Business validation:

- Unknown path IDs return `WATCH_PATH_NOT_FOUND`.
- The backend resolves missing TVLore catalog IDs from the path's TMDB refs before saving.
- Repeated calls are idempotent because show/movie watchlist rows are unique per user and title.
- Mobile does not issue one request per path item; the backend owns the bulk action.

Errors: `WATCH_PATH_NOT_FOUND`, `UNAUTHORIZED`.

## Future Social API

These endpoints are conceptual and out of scope for MVP.

### `POST /match-links`

Purpose: create an opaque share/deep-link token for future profile comparison.

Auth: required.

Request:

```json
{
  "expiresInHours": 24
}
```

Response:

```json
{
  "id": "uuid",
  "url": "https://tvlore.app/m/opaque-token",
  "expiresAt": "2026-08-10T00:00:00.000Z"
}
```

Business validation:

- User allows comparisons.
- Expiration does not exceed policy.
- Token is opaque and high entropy.

### `POST /matches`

Purpose: resolve a match token for the authenticated scanning user and create or calculate a match result.

Auth: required.

Request:

```json
{
  "token": "opaque-token"
}
```

Response:

```json
{
  "id": "uuid-or-null-for-ephemeral",
  "tasteMatchPercent": 87,
  "commonTitleCount": 183,
  "sections": {
    "bothWatched": [],
    "viewerOnly": [],
    "ownerOnly": [],
    "watchTogether": []
  }
}
```

Business validation:

- Token exists, is unexpired, and is not revoked.
- Both users are identified.
- Owner and viewer privacy settings allow comparison.
- Returned data is derived/authorized.

### `GET /matches/:matchId`

Purpose: retrieve a persisted match result if persisted comparison is adopted.

Auth: required.

Business validation:

- Authenticated user is a participant.
- Result visibility is still allowed.

### `DELETE /match-links/:matchLinkId`

Purpose: revoke a future share token.

Auth: required.

Business validation:

- Authenticated user owns the link.
- Revocation is idempotent.
