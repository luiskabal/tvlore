# Current State

This document explains what TVLore has implemented right now. It is intentionally practical: read it when you want to understand the current moving parts, request flows, database state, and what each piece is doing.

## 1. What Exists Today

Implemented:

- Monorepo with `apps/api`, `apps/mobile`, `packages/contracts`, and `docs`.
- NestJS backend deployed to Vercel at `https://tvlore-api.vercel.app`.
- Expo mobile app that can authenticate with Google through Supabase Auth.
- Supabase Postgres database connected to the backend through Prisma.
- Supabase Auth token validation in the backend.
- Authenticated `GET /users/me`.
- Authenticated `GET /search` backed by TMDB.
- Authenticated `POST /catalog/resolve` that converts TMDB refs into TVLore internal IDs.
- Authenticated show/movie detail endpoints by internal TVLore ID.
- Season list and season detail endpoints for shows.
- Episode catalog persistence when a season is opened.
- Authenticated watch/unwatch endpoints for episodes and movies.
- Authenticated show-level watch/unwatch endpoint that hydrates seasons and updates all episode watches for the show.
- Authenticated watchlist endpoints for shows and movies.
- Authenticated rating preference endpoints for shows and movies.
- Authenticated personal library and show progress read endpoints.
- Authenticated first-pass recommendation endpoint from stored ratings and hydrated catalog rows.
- Mobile Library/Profile routes read the authenticated user and personal library summary from the API.
- Mobile search resolves provider results and opens backend-owned show/movie detail screens.
- Mobile show detail opens backend-owned season episode lists.
- Mobile search result rows and show season rows navigate by tapping the full row.
- Mobile show detail displays backend-owned progress state for persisted episodes.
- Mobile season detail can mark episodes watched or unwatched.
- Mobile season detail can mark all loaded season episodes watched or unwatched.
- Mobile show detail can mark the full show watched or unwatched through one backend-owned bulk action.
- Mobile show/movie detail can add or remove a title from the watchlist.
- Mobile show/movie detail can rate or clear a rating preference for a title.
- Mobile tracking mutations invalidate the local library data.
- Mobile watchlist mutations invalidate the local library data.
- Mobile Library/Profile refresh authenticated library data after tracking changes.
- Mobile Library can show backend-owned recommendation candidates.
- Mobile recommendation rows can save titles directly to the watchlist with optimistic feedback.
- Mobile Library shows watchlist titles and rated titles separately from watched history.
- Mobile Library summary cards filter Cronologia, recommendations, continuing shows, recently watched movies, watched episodes grouped by show and season, watchlist, and rated titles.
- Mobile Library rows render catalog poster thumbnails when available, with stable placeholders otherwise.
- Mobile Library episode season subsections can be expanded or collapsed with a tap.
- Mobile Profile renders a touch-driven holo profile card with Google avatar and library stats.
- Mobile library rows navigate back to movie detail or show season detail screens.
- Mobile Library rows can remove watchlist items and undo recent watched markers through confirmable swipe actions.
- Mobile Library applies optimistic row removal after swipe confirmation and rolls back on API error.
- Mobile Library/Profile keep previous library data during refreshes and render skeletons on initial load.
- Mobile has routed Library, Search, and Profile surfaces with persistent bottom app navigation.
- Postman collection and local/Vercel environments.
- Environment validation for local and Vercel.
- Backend unit tests with Vitest.
- HTTP contract smoke checks through `corepack pnpm api:check`.

Not implemented yet:

- Social matching.
- Richer recommendation ranking with genres, providers, or collaborative signals.

## 2. Current System Diagram

```mermaid
flowchart LR
  User[User]
  Mobile[Expo Mobile App]
  Postman[Postman]
  SupabaseAuth[Supabase Auth]
  Google[Google OAuth]
  API[TVLore API on Vercel]
  DB[(Supabase Postgres)]
  TMDB[TMDB API]

  User --> Mobile
  User --> Postman

  Mobile --> SupabaseAuth
  Postman --> SupabaseAuth
  SupabaseAuth --> Google
  Google --> SupabaseAuth
  SupabaseAuth --> Mobile
  SupabaseAuth --> Postman

  Mobile --> API
  Postman --> API
  API --> SupabaseAuth
  API --> DB
  API --> TMDB
```

What this means:

- The client gets a Supabase session through Google.
- The client calls TVLore with `Authorization: Bearer <supabase_access_token>`.
- The backend validates that token against Supabase Auth.
- The backend owns product data in Postgres.
- The backend calls TMDB with `TMDB_ACCESS_TOKEN`.
- The mobile app and Postman never receive the TMDB token.

## 3. Runtime Infrastructure

```mermaid
flowchart TB
  GitHub[GitHub main branch]
  Vercel[Vercel project: tvlore-api]
  API[Production API]
  Env[Vercel env vars]
  Supabase[(Supabase Postgres)]
  SupabaseAuth[Supabase Auth]
  TMDB[TMDB]

  GitHub --> Vercel
  Vercel --> API
  Env --> API
  API --> Supabase
  API --> SupabaseAuth
  API --> TMDB
```

Current production target:

```text
https://tvlore-api.vercel.app
```

Required backend environment variables:

```text
DATABASE_URL
MIGRATE_DATABASE_URL
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
TMDB_ACCESS_TOKEN
```

Why they exist:

- `DATABASE_URL`: runtime database connection from the API.
- `MIGRATE_DATABASE_URL`: direct database connection for Prisma migrations.
- `SUPABASE_URL`: Supabase project URL used to validate access tokens.
- `SUPABASE_PUBLISHABLE_KEY`: Supabase public key used by backend token validation calls.
- `TMDB_ACCESS_TOKEN`: server-side TMDB API Read Access Token.

## 4. Backend Shape

```mermaid
flowchart TB
  Controllers[Controllers]
  Services[Services / Use Cases]
  Repositories[Repositories]
  Providers[External Providers]
  Prisma[PrismaService]
  DB[(Postgres)]
  SupabaseAuth[Supabase Auth REST]
  TMDB[TMDB REST]

  Controllers --> Services
  Services --> Repositories
  Services --> Providers
  Repositories --> Prisma
  Prisma --> DB
  Providers --> SupabaseAuth
  Providers --> TMDB
```

Current backend modules:

- `auth`: validates bearer tokens against Supabase.
- `users`: resolves the authenticated Supabase user into a TVLore user.
- `catalog`: searches TMDB, resolves TMDB items, and persists TVLore catalog IDs.
- `preferences`: stores explicit per-user ratings for shows and movies.
- `health`: verifies API and database availability.
- `config`: loads and validates environment variables at startup.

The current pattern is:

```text
Controller -> Service -> Repository or Provider -> External System
```

Why this matters:

- Controllers stay thin and HTTP-focused.
- Services coordinate use cases.
- Repositories own database writes and transactions.
- Providers isolate external systems like Supabase Auth and TMDB.
- Pure mapping/parsing functions are unit tested.

## 5. Authentication Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Supabase Auth
  participant G as Google
  participant A as TVLore API
  participant D as Postgres

  C->>S: Start Google OAuth
  S->>G: Redirect to Google
  G-->>S: Google identity accepted
  S-->>C: Supabase access_token and refresh_token
  C->>A: GET /users/me with Bearer access_token
  A->>S: GET /auth/v1/user
  S-->>A: Supabase user
  A->>D: Upsert UserIdentity and User
  D-->>A: TVLore user
  A-->>C: User DTO
```

Implemented endpoint:

```text
GET /users/me
```

What it does:

1. Reads the `Authorization` header.
2. Extracts the bearer token.
3. Calls Supabase Auth to validate the token.
4. Maps the Supabase user into an internal authenticated-user shape.
5. Upserts `user_identities`.
6. Upserts or updates `users`.
7. Returns the TVLore user.

Important detail:

Supabase owns login/session issuance today. TVLore owns the internal user record once a valid Supabase user reaches the backend.

## 6. Catalog Search Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant A as TVLore API
  participant S as Supabase Auth
  participant T as TMDB
  participant D as Postgres

  C->>A: GET /search?query=dark&types=show,movie&page=1
  A->>S: Validate bearer token
  S-->>A: Supabase user
  A->>D: Upsert/resolve TVLore user
  A->>T: GET /search/multi
  T-->>A: TMDB movie/tv/person results
  A->>A: Keep only movie and tv results
  A->>D: Look up existing external identifiers
  D-->>A: Existing TVLore IDs, if any
  A-->>C: Normalized search response
```

Implemented endpoint:

```text
GET /search
```

Request example:

```text
GET /search?query=dark&types=show,movie&page=1
```

Response shape:

```json
{
  "page": 1,
  "query": "dark",
  "results": [
    {
      "mediaType": "show",
      "title": "Dark",
      "year": 2017,
      "overview": "A missing child sets four families on a frantic hunt for answers.",
      "posterPath": "/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg",
      "externalRef": {
        "provider": "tmdb",
        "providerId": "70523"
      },
      "tvloreId": null
    }
  ]
}
```

What `tvloreId` means:

- `null`: result exists only as a TMDB-backed search result.
- UUID: result has already been resolved into a TVLore internal catalog record.

Why search does not immediately persist every result:

- Search can return many irrelevant results.
- Persisting only on interaction keeps the DB small.
- The user must choose a title before TVLore creates durable internal identity.

## 7. Catalog Resolve Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant A as TVLore API
  participant S as Supabase Auth
  participant T as TMDB
  participant D as Postgres

  C->>A: POST /catalog/resolve
  A->>S: Validate bearer token
  S-->>A: Supabase user
  A->>D: Upsert/resolve TVLore user
  A->>A: Validate mediaType/provider/providerId
  A->>T: GET /tv/:id or /movie/:id
  T-->>A: TMDB detail response
  A->>A: Normalize detail into TVLore catalog item
  A->>D: Transaction: find ExternalIdentifier
  alt Already resolved
    A->>D: Update existing Show/Movie metadata
  else First resolution
    A->>D: Create Show/Movie
    A->>D: Create ExternalIdentifier
  end
  D-->>A: Internal TVLore ID
  A-->>C: { id, mediaType }
```

Implemented endpoint:

```text
POST /catalog/resolve
```

Request example:

```json
{
  "mediaType": "show",
  "provider": "tmdb",
  "providerId": "70523"
}
```

Response example:

```json
{
  "id": "tvlore-uuid",
  "mediaType": "show"
}
```

What it does:

1. Validates the Supabase access token.
2. Validates the request body.
3. Calls the TMDB detail endpoint.
4. Normalizes TMDB detail into a TVLore catalog item.
5. Opens a database transaction.
6. Checks `external_identifiers` for an existing mapping.
7. If found, updates existing metadata and returns the existing internal ID.
8. If missing, creates a `show` or `movie`.
9. Creates the matching `external_identifier`.
10. Returns the internal TVLore ID.

Why this endpoint matters:

Search gives us provider refs. Resolve gives us product identity. Watch history should reference TVLore UUIDs, not TMDB IDs.

## 8. Catalog Detail Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant A as TVLore API
  participant S as Supabase Auth
  participant T as TMDB
  participant D as Postgres

  C->>A: GET /shows/:showId
  A->>S: Validate bearer token
  S-->>A: Supabase user
  A->>D: Load show and season summaries
  D-->>A: Show detail
  A-->>C: Show detail response

  C->>A: GET /shows/:showId/seasons/:seasonNumber
  A->>S: Validate bearer token
  S-->>A: Supabase user
  A->>D: Find TMDB provider ID for show
  A->>T: GET /tv/:seriesId/season/:seasonNumber
  T-->>A: Season detail with episodes
  A->>D: Upsert season and episodes
  D-->>A: Internal episode IDs
  A-->>C: Season detail response
```

Implemented endpoints:

```text
GET /shows/:showId
GET /shows/:showId/seasons
GET /shows/:showId/seasons/:seasonNumber
GET /movies/:movieId
POST /episodes/:episodeId/watches
DELETE /episodes/:episodeId/watches
POST /shows/:showId/watches
DELETE /shows/:showId/watches
POST /movies/:movieId/watches
DELETE /movies/:movieId/watches
POST /shows/:showId/watchlist
DELETE /shows/:showId/watchlist
POST /movies/:movieId/watchlist
DELETE /movies/:movieId/watchlist
PUT /shows/:showId/preference
DELETE /shows/:showId/preference
PUT /movies/:movieId/preference
DELETE /movies/:movieId/preference
GET /shows/:showId/progress
GET /library
GET /recommendations
```

Current watched-state behavior:

- Movies return `watched`, `watchCount`, and `lastWatchedAt` for the authenticated user.
- Episodes return `watched`, `watchCount`, and `lastWatchedAt` for the authenticated user.
- Mark watched/unwatched is idempotent in the MVP: one active row per user/movie or user/episode.
- Show-level mark watched/unwatched is a backend-owned bulk action. Mark watched hydrates all non-empty seasons first, then upserts one watch row per episode for the authenticated user.
- Add/remove watchlist is idempotent in the MVP: one active row per user/show or user/movie.
- Rating preferences are explicit and separate from watched state: one active row per user/show or user/movie, with `rating` from 1 to 5.
- Show progress returned by show detail, episode watch mutations, and `GET /shows/:showId/progress` is based on episodes currently persisted in TVLore. Opening a season hydrates its episode rows.
- Show detail returns `progress.status` as `not_started`, `watching`, or `completed`.
- Show and movie detail responses return `inWatchlist` and nullable `rating` for the authenticated user.
- `GET /library` returns summary counts, continue-watching shows, rated titles, recent movie/episode activity, full watched episode activity, and watchlist titles for the authenticated user.

Why season detail fetches TMDB:

- Show resolve persists season summaries, not every episode.
- Opening a season is the first point where the user needs episode IDs.
- This avoids pulling every episode for every season during search or resolve.

## 9. Current Database Model

```mermaid
erDiagram
  USER ||--o{ USER_IDENTITY : has
  USER ||--o{ REFRESH_SESSION : has
  USER ||--o{ EPISODE_WATCH : marks
  USER ||--o{ MOVIE_WATCH : marks
  USER ||--o{ SHOW_WATCHLIST_ITEM : saves
  USER ||--o{ MOVIE_WATCHLIST_ITEM : saves
  USER ||--o{ SHOW_PREFERENCE : rates
  USER ||--o{ MOVIE_PREFERENCE : rates
  SHOW ||--o{ SEASON : has
  SHOW ||--o{ EPISODE : has
  SHOW ||--o{ SHOW_WATCHLIST_ITEM : saved
  SHOW ||--o{ SHOW_PREFERENCE : rated
  SEASON ||--o{ EPISODE : contains
  EPISODE ||--o{ EPISODE_WATCH : watched
  MOVIE ||--o{ MOVIE_WATCH : watched
  MOVIE ||--o{ MOVIE_WATCHLIST_ITEM : saved
  MOVIE ||--o{ MOVIE_PREFERENCE : rated
  SHOW ||--o{ EXTERNAL_IDENTIFIER : maps
  MOVIE ||--o{ EXTERNAL_IDENTIFIER : maps

  USER {
    uuid id PK
    string displayName
    datetime createdAt
    datetime updatedAt
  }

  USER_IDENTITY {
    uuid id PK
    uuid userId FK
    string provider
    string providerSubject
    string email
    datetime createdAt
    datetime updatedAt
  }

  REFRESH_SESSION {
    uuid id PK
    uuid userId FK
    string tokenHash
    datetime expiresAt
    datetime revokedAt
    datetime rotatedAt
    datetime lastUsedAt
    string deviceLabel
  }

  SHOW {
    uuid id PK
    string title
    string originalTitle
    string overview
    string posterPath
    string backdropPath
    date firstAirDate
    datetime createdAt
    datetime updatedAt
  }

  MOVIE {
    uuid id PK
    string title
    string originalTitle
    string overview
    string posterPath
    string backdropPath
    date releaseDate
    int runtimeMinutes
    datetime createdAt
    datetime updatedAt
  }

  SEASON {
    uuid id PK
    uuid showId FK
    int seasonNumber
    string title
    string overview
    string posterPath
    date airDate
    int episodeCount
    datetime createdAt
    datetime updatedAt
  }

  EPISODE {
    uuid id PK
    uuid showId FK
    uuid seasonId FK
    int seasonNumber
    int episodeNumber
    string title
    string overview
    string stillPath
    date airDate
    int runtimeMinutes
    datetime createdAt
    datetime updatedAt
  }

  EXTERNAL_IDENTIFIER {
    uuid id PK
    string entityType
    uuid entityId
    string provider
    string providerId
    datetime createdAt
  }

  EPISODE_WATCH {
    uuid id PK
    uuid userId FK
    uuid episodeId FK
    datetime watchedAt
    datetime createdAt
  }

  MOVIE_WATCH {
    uuid id PK
    uuid userId FK
    uuid movieId FK
    datetime watchedAt
    datetime createdAt
  }

  SHOW_WATCHLIST_ITEM {
    uuid id PK
    uuid userId FK
    uuid showId FK
    datetime createdAt
  }

  MOVIE_WATCHLIST_ITEM {
    uuid id PK
    uuid userId FK
    uuid movieId FK
    datetime createdAt
  }

  SHOW_PREFERENCE {
    uuid id PK
    uuid userId FK
    uuid showId FK
    int rating
    datetime createdAt
    datetime updatedAt
  }

  MOVIE_PREFERENCE {
    uuid id PK
    uuid userId FK
    uuid movieId FK
    int rating
    datetime createdAt
    datetime updatedAt
  }
```

Current tables:

- `users`: TVLore account/profile row.
- `user_identities`: links a TVLore user to Supabase Auth.
- `refresh_sessions`: exists for the originally planned TVLore-owned refresh-token model; Supabase owns sessions in the current MVP.
- `shows`: internal TVLore show records created by resolve.
- `movies`: internal TVLore movie records created by resolve.
- `seasons`: internal TVLore season records created from TMDB show details.
- `episodes`: internal TVLore episode records created when a season is opened.
- `external_identifiers`: maps TVLore IDs to provider refs like `tmdb:70523`.
- `episode_watches`: per-user watched marker for an episode.
- `movie_watches`: per-user watched marker for a movie.
- `show_watchlist_items`: per-user saved-intent marker for a show.
- `movie_watchlist_items`: per-user saved-intent marker for a movie.
- `show_preferences`: per-user 1-5 rating preference for a show.
- `movie_preferences`: per-user 1-5 rating preference for a movie.

Important constraint:

```text
external_identifiers(entity_type, provider, provider_id) is unique
episode_watches(user_id, episode_id) is unique
movie_watches(user_id, movie_id) is unique
show_watchlist_items(user_id, show_id) is unique
movie_watchlist_items(user_id, movie_id) is unique
show_preferences(user_id, show_id) is unique
movie_preferences(user_id, movie_id) is unique
```

Why:

- A TMDB show ID should resolve to exactly one TVLore show ID.
- Repeated resolve calls stay idempotent.
- Watch tracking references stable TVLore UUIDs.
- Repeated mark-watched calls stay idempotent.
- Watchlist tracking references stable TVLore UUIDs.
- Repeated add-to-watchlist calls stay idempotent.
- Rating preferences reference stable TVLore UUIDs.
- Repeated rating calls update the same preference row.
- Watched state belongs to a user, not to the catalog row.

Implementation note:

`external_identifiers.entity_id` is a logical polymorphic reference. It can point to a `show` or a `movie` depending on `entity_type`. There is no direct database foreign key for this polymorphic relation today; consistency is enforced in `CatalogRepository` inside the resolve transaction.

## 10. Postman Test Path

```mermaid
flowchart TB
  Env[Select TVLore Vercel environment]
  Login[Auth / Supabase / Open Google OAuth URL]
  Token[Paste access_token into supabaseAccessToken Current value]
  Validate[Auth / Supabase / GET Supabase user]
  Me[Users / GET /users/me]
  Search[Catalog / GET /search]
  ResolveShow[Catalog / POST /catalog/resolve show]
  Show[Catalog / GET /shows/:showId]
  Seasons[Catalog / GET /shows/:showId/seasons]
  Season[Catalog / GET /shows/:showId/seasons/1]
  EpisodeWatch[Tracking / POST /episodes/:episodeId/watches]
  Progress[Library / GET /shows/:showId/progress]
  EpisodeUnwatch[Tracking / DELETE /episodes/:episodeId/watches]
  ResolveMovie[Catalog / POST /catalog/resolve movie]
  Movie[Catalog / GET /movies/:movieId]
  MovieWatch[Tracking / POST /movies/:movieId/watches]
  ShowWatchlist[Watchlist / POST /shows/:showId/watchlist]
  ShowRating[Preferences / PUT /shows/:showId/preference]
  MovieWatchlist[Watchlist / POST /movies/:movieId/watchlist]
  MovieRating[Preferences / PUT /movies/:movieId/preference]
  Library[Library / GET /library]
  Recommendations[Recommendations / GET /recommendations]
  ShowBulkWatch[Tracking / POST /shows/:showId/watches]
  ShowBulkUnwatch[Tracking / DELETE /shows/:showId/watches]
  MovieUnwatch[Tracking / DELETE /movies/:movieId/watches]

  Env --> Login
  Login --> Token
  Token --> Validate
  Validate --> Me
  Me --> Search
  Search --> ResolveShow
  ResolveShow --> Show
  Show --> ShowWatchlist
  ShowWatchlist --> ShowRating
  ShowRating --> Seasons
  Seasons --> Season
  Season --> EpisodeWatch
  EpisodeWatch --> Progress
  Progress --> EpisodeUnwatch
  EpisodeUnwatch --> ResolveMovie
  ResolveMovie --> Movie
  Movie --> MovieWatchlist
  MovieWatchlist --> MovieRating
  MovieRating --> MovieWatch
  MovieWatch --> Library
  Library --> Recommendations
  Recommendations --> ShowBulkWatch
  ShowBulkWatch --> ShowBulkUnwatch
  ShowBulkUnwatch --> MovieUnwatch
```

Expected behavior:

- `GET /health` and `GET /health/db` return `200` without auth.
- `GET /users/me`, `GET /search`, and `POST /catalog/resolve` return `401` without auth.
- `GET /users/me` returns the authenticated TVLore user with a valid Supabase token.
- `GET /search` returns normalized TMDB-backed results.
- `POST /catalog/resolve` returns a TVLore UUID.
- Running `GET /search` again after resolve should show `tvloreId` for the resolved item.
- `GET /shows/:showId` returns show detail and season summaries.
- `GET /shows/:showId/seasons/:seasonNumber` fetches and persists that season's episodes.
- `POST /episodes/:episodeId/watches` marks an episode watched for the authenticated user.
- `GET /shows/:showId/progress` returns show/season progress for the authenticated user.
- `DELETE /episodes/:episodeId/watches` marks that episode unwatched for the authenticated user.
- `POST /movies/:movieId/watches` marks a movie watched for the authenticated user.
- `POST /shows/:showId/watchlist` saves a show for later for the authenticated user.
- `DELETE /shows/:showId/watchlist` removes that saved show for the authenticated user.
- `POST /movies/:movieId/watchlist` saves a movie for later for the authenticated user.
- `DELETE /movies/:movieId/watchlist` removes that saved movie for the authenticated user.
- `PUT /shows/:showId/preference` stores a 1-5 show rating for the authenticated user.
- `DELETE /shows/:showId/preference` clears that show rating for the authenticated user.
- `PUT /movies/:movieId/preference` stores a 1-5 movie rating for the authenticated user.
- `DELETE /movies/:movieId/preference` clears that movie rating for the authenticated user.
- `GET /library` returns personal summary, rated titles, continue-watching, watchlist, recently watched activity, and full watched episode activity.
- `GET /recommendations` returns unrated, unwatched, unsaved catalog candidates ordered by the user's stronger rated media type.
- `POST /shows/:showId/watches` hydrates the show seasons, marks every episode watched, and returns completed show progress.
- `DELETE /shows/:showId/watches` removes every episode watch marker for that show and returns not-started show progress.
- `DELETE /movies/:movieId/watches` marks that movie unwatched for the authenticated user.
- `GET /movies/:movieId` returns movie detail with authenticated user's watched state.

## 11. Mobile Frontend Slice

The current mobile app has these product-facing slices:

```text
Library
-> Supabase session
-> GET /users/me, GET /library, and GET /recommendations in parallel
-> Library summary, recommendations, watchlist, rated titles, continue-watching, recently-watched

Profile
-> Supabase session
-> GET /users/me and GET /library in parallel
-> Holo profile card, library stats, account state, sign out

Search
-> GET /search
-> POST /catalog/resolve
-> Show or movie detail route
-> GET /shows/:id or GET /movies/:id
-> Show detail progress state
-> Show/movie watchlist add/remove
-> Show/movie rating set/clear
-> Show-level watched/unwatched
-> Show season route
-> GET /shows/:id/seasons/:seasonNumber
-> Episode watch/unwatch
```

Current behavior:

- Signed-out users can start Google login.
- Signed-in users can refresh authenticated backend state.
- Library/Profile refresh avoids the public health check and loads only authenticated product data.
- Library shows watched counts for shows, movies, episodes, watchlist items, and rated titles.
- Profile shows library counts for shows, movies, episodes, and rated titles in a holo profile card.
- The profile card uses Google avatar metadata when available and initials as a fallback.
- Library shows continue-watching and recently watched rows when the backend has watched data.
- Library shows saved watchlist rows when the backend has watchlist data.
- Library shows rated show/movie rows when the backend has rating preference data.
- Library shows recommendation rows in a dedicated `For you` filter when the backend has eligible catalog candidates.
- Recommendation rows open the matching show or movie detail screen.
- Recommendation rows can save the title to watchlist immediately, then reconcile through the existing library refresh invalidator.
- Library can filter from its summary cards between Cronologia, recommendations, continuing shows, recently watched movies, watched episodes grouped by show and season, saved titles, and rated titles. Cronologia only shows watched movies and episodes by date.
- Episode groups keep each season collapsible so long watched histories stay scannable.
- Library rows include compact poster thumbnails for quicker visual scanning.
- Continue-watching rows open the next season, recently watched movies open movie detail, and recently watched episodes open the matching season.
- Watchlist rows can remove saved titles through confirmable swipe actions, and recently watched rows can undo the underlying movie or episode watched marker through confirmable swipe actions.
- Bottom app navigation connects Library, Search, and Profile from the root layout, so the tab bar stays stable while route content changes.
- Empty library state is expected after cleanup-oriented smoke checks.
- Search supports all/show/movie filters.
- Search prefetches results with a debounce after the user enters at least three characters.
- Stale search responses are ignored so older results cannot overwrite newer queries.
- Search renders skeleton rows on initial loading and when filters change.
- Search keeps previous results visible during typed-query refreshes to avoid UI flicker.
- Search code is split into route/container, controls, results, hook, and styles modules.
- Opening a search result resolves it into a TVLore ID before navigating.
- Detail screens render backend-owned show/movie data.
- Detail screens render content-shaped skeletons while show, movie, or season data loads.
- Show detail displays backend-owned progress state: not started, watching, or completed.
- Movie detail can mark a movie watched or unwatched.
- Movie watch actions update local detail state optimistically, then reconcile from the backend mutation response.
- Show detail can mark the full show watched or unwatched with one backend request and then reconcile progress from the backend mutation response.
- Show and movie detail can add or remove the title from the watchlist.
- Watchlist actions update local detail state optimistically, then reconcile from the backend mutation response.
- Show and movie detail can set or clear a 1-5 rating preference.
- Rating actions update local detail state optimistically, then reconcile from the backend mutation response.
- Show detail lists seasons and opens a season route.
- Season detail loads backend-owned episode IDs and watched state.
- Season detail can mark episodes watched or unwatched.
- Season detail can mark all currently loaded episodes watched or unwatched.
- Tracking, watchlist, and rating mutations invalidate `GET /library`, so recent watch changes, saved intent, and rated titles appear without pressing Refresh when the user returns to Library or Profile.
- Episode watch actions update the touched episode and display returned show progress.

Why this shape matters:

- The mobile app owns presentation only.
- Supabase owns session storage and refresh.
- The backend owns product reads, progress, library calculations, and recommendation heuristics.
- The frontend now has a proven contract for authenticated library and tracking flows.

## 12. What We Proved

Infrastructure:

- Vercel can build and run the NestJS API.
- Vercel can reach Supabase Postgres.
- Vercel has the required backend env vars.
- Supabase Google login works.
- Postman can obtain a Supabase session through OAuth callback.
- TMDB access works from backend only.

Backend architecture:

- Config is centralized and validated at startup.
- Errors use a consistent envelope with `code`, `message`, `details`, and `correlationId`.
- Requests emit JSON logs with method, route, status code, correlation ID, and latency in milliseconds.
- Auth token validation is isolated in `SupabaseAuthService`.
- User persistence is isolated in `UsersRepository`.
- TMDB HTTP and provider errors are isolated in `TmdbClient`.
- Catalog persistence is isolated in `CatalogRepository`.
- Tracking persistence is isolated in `TrackingRepository`.
- Watchlist persistence is isolated in `WatchlistRepository`.
- Library/progress reads are isolated in `LibraryRepository`.
- Search/resolve/detail parsing and mapping are pure functions with unit tests.
- `api:check` validates public health, protected-route errors, and authenticated product contracts when a Supabase token is supplied.

Product foundation:

- TVLore owns internal user IDs.
- TVLore owns internal catalog IDs.
- TMDB IDs are external references only.
- Watch tracking is stored against internal TVLore IDs and authenticated user IDs.
- Watchlist intent is stored against internal TVLore IDs and authenticated user IDs.
- Rating preferences are stored against internal TVLore IDs and authenticated user IDs.
- Show progress status is calculated by the backend from persisted episode watches.
- Mobile can render backend-owned library data through the same Supabase token used by Postman.
- Mobile can search TMDB-backed catalog data without receiving TMDB credentials.
- Mobile can prefetch search results without prefetching database writes.
- Mobile can resolve a provider result and open internal show/movie details by TVLore ID.
- Mobile can mark movies watched/unwatched through backend tracking endpoints.
- Mobile can add/remove shows and movies from the watchlist through backend watchlist endpoints.
- Mobile can rate shows and movies through backend preference endpoints.
- Mobile can remove watchlist/history rows immediately after swipe confirmation backed by existing backend watchlist and tracking endpoints.
- Mobile can render library thumbnails from existing poster data without extra API calls.
- Mobile can open a show season, hydrate episode IDs, and mark episodes watched/unwatched through backend tracking endpoints.
- Mobile can bulk-mark the loaded episodes in a season by orchestrating existing idempotent episode tracking endpoints.
- Mobile can bulk-mark a full show through a backend-owned tracking endpoint instead of issuing one request per episode.
- Mobile has primary Library, Search, and Profile routes over the same authenticated API session.

## 13. Why This Backend Base Helps The Frontend

The frontend can stay simple because the backend already owns the hard parts:

- The app does not need TMDB credentials.
- The app does not need to know database structure.
- The app does not decide whether a provider item already exists internally.
- The app can call `GET /search`, show results, call `POST /catalog/resolve`, then navigate using a TVLore ID.

The frontend flow is now:

```text
Search screen
-> user selects result
-> POST /catalog/resolve
-> navigate to show/movie detail using TVLore ID
-> detail screen loads backend-owned details
-> show detail displays backend-owned progress status
-> detail screen can POST/DELETE watchlist state
-> movie detail can POST/DELETE /movies/:movieId/watches
-> show detail can POST/DELETE /shows/:showId/watches
-> show detail can navigate to a season
-> season detail can POST/DELETE /episodes/:episodeId/watches
```

The remaining near-term frontend product flow is:

```text
Richer loading and mutation feedback
-> recommendation quality once catalog signals improve
-> social matching after the personal library loop stays stable
```

## 14. Recommended Next Step

Improve recommendation quality by persisting richer catalog signals:

```text
Resolve show or movie
-> persist genres/provider signals
-> use ratings plus content metadata for recommendations
```

Why this is next:

- Watched history, watchlist, ratings, and bulk tracking now cover the core personal-library loop.
- Recommendations currently use only hydrated catalog rows and explicit ratings.
- Stronger catalog metadata will improve suggestions without adding social complexity yet.
