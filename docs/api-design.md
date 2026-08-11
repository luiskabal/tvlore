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

### `GET /search`

Purpose: search TV shows and movies through the backend catalog provider boundary.

Current MVP status: implemented for provider-backed search results.

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

- `200 OK` if already exists
- `201 CREATED` if newly persisted
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

Auth: required.

Route parameters:

- `showId` UUID.

Query parameters:

- `includeProgress` optional boolean.

Request: none.

Response:

```json
{
  "id": "uuid",
  "title": "Dark",
  "overview": "A family saga with a supernatural twist.",
  "posterPath": "/path.jpg",
  "firstAirDate": "2017-12-01",
  "seasons": [
    {
      "seasonNumber": 1,
      "episodeCount": 10
    }
  ],
  "progress": null
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
- `includeProgress` boolean if present.

Business validation:

- Show exists.
- Provider refresh may occur if metadata is stale.
- Progress, if requested, is calculated for authenticated user.

Errors: `SHOW_NOT_FOUND`, `VALIDATION_FAILED`, `CATALOG_PROVIDER_UNAVAILABLE`.

### `GET /shows/:showId/seasons`

Purpose: list seasons for a show.

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

### `GET /movies/:movieId`

Purpose: return movie details and authenticated user's watch state.

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
    "showId": "uuid",
    "watchedEpisodeCount": 1,
    "totalEpisodeCount": 10,
    "percentComplete": 10
  }
}
```

Status codes:

- `200 OK` if already watched and endpoint is idempotent
- `201 CREATED` if a watch record is created
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only create their own watch record.

Transport validation:

- `episodeId` UUID.
- `watchedAt` ISO datetime if present.

Business validation:

- Episode exists.
- Backend decides idempotency and rewatch behavior.
- Progress is recalculated server-side.

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
    "showId": "uuid",
    "watchedEpisodeCount": 0,
    "totalEpisodeCount": 10,
    "percentComplete": 0
  }
}
```

Status codes:

- `200 OK`
- `204 NO_CONTENT` if response body is omitted
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own watch records.

Transport validation:

- `episodeId` UUID.

Business validation:

- Episode exists.
- All MVP watch records for that user/episode are removed.
- Progress is recalculated server-side.

Errors: `EPISODE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

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
- `201 CREATED`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only create their own watch record.

Transport validation:

- `movieId` UUID.
- `watchedAt` ISO datetime if present.

Business validation:

- Movie exists.
- Backend decides idempotency and rewatch behavior.

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
- `204 NO_CONTENT`
- `400 BAD_REQUEST`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

Authorization: authenticated user may only remove their own watch records.

Transport validation:

- `movieId` UUID.

Business validation:

- Movie exists.
- All MVP watch records for that user/movie are removed.

Errors: `MOVIE_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHORIZED`.

### `GET /shows/:showId/progress`

Purpose: return backend-calculated show and season progress for authenticated user.

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

Auth: required.

Route parameters: none.

Query parameters:

- `section` optional enum: `all`, `continueWatching`, `shows`, `movies`.
- `page` optional positive integer.

Request: none.

Response:

```json
{
  "summary": {
    "watchedShowCount": 12,
    "watchedMovieCount": 34,
    "watchedEpisodeCount": 183
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
        "episodeNumber": 5
      }
    }
  ],
  "recentlyWatched": [
    {
      "mediaType": "movie",
      "id": "uuid",
      "title": "Arrival",
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

Transport validation:

- Section enum.
- Page positive integer.

Business validation:

- Summary and progress are calculated by backend.
- Results include only authenticated user's data.

Errors: `VALIDATION_FAILED`, `UNAUTHORIZED`.

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
