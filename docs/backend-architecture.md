# Backend Architecture

The backend is a NestJS modular monolith.

## Conceptual Layout

```text
src/
|-- auth/
|-- users/
|-- catalog/
|   |-- shows/
|   |-- movies/
|   |-- seasons/
|   `-- episodes/
|
|-- tracking/
|-- preferences/
|-- reflections/
|-- watchlist/
|-- library/
|-- recommendations/
|-- discovery/
|-- watch-paths/
|
`-- integrations/
    `-- tmdb/
```

Future modules may include:

```text
social/
matches/
notifications/
```

Do not implement future modules in the MVP.

## Current Implemented Layout

The current codebase uses the same pattern in a smaller form:

```text
src/
|-- auth/
|   |-- bearer-token.ts
|   |-- authenticated-user.ts
|   |-- supabase-auth.service.ts
|   `-- __tests__/
|
|-- users/
|   |-- users.controller.ts
|   |-- users.service.ts
|   |-- users.repository.ts
|   |-- users.types.ts
|   |-- user-profile.ts
|   `-- __tests__/
|
|-- catalog/
|   |-- catalog.controller.ts
|   |-- catalog-cast.ts
|   |-- catalog-detail.ts
|   |-- catalog-watch-providers.ts
|   |-- catalog.repository.ts
|   |-- catalog-resolve.ts
|   |-- catalog.service.ts
|   |-- catalog-search.ts
|   |-- catalog.types.ts
|   |-- tmdb-client.ts
|   `-- __tests__/
|
|-- tracking/
|   |-- tracking.controller.ts
|   |-- tracking-input.ts
|   |-- tracking.repository.ts
|   |-- tracking.service.ts
|   |-- tracking.types.ts
|   `-- __tests__/
|
|-- watchlist/
|   |-- watchlist.controller.ts
|   |-- watchlist.repository.ts
|   |-- watchlist.service.ts
|   |-- watchlist.types.ts
|   `-- __tests__/
|
|-- reflections/
|   |-- reflections.controller.ts
|   |-- reflections-input.ts
|   |-- reflections.repository.ts
|   |-- reflections.service.ts
|   |-- reflections.types.ts
|   `-- __tests__/
|
|-- library/
|   |-- library.controller.ts
|   |-- library.repository.ts
|   |-- library.service.ts
|   `-- library.types.ts
|
|-- recommendations/
|   |-- recommendations.controller.ts
|   |-- recommendations.repository.ts
|   |-- recommendations.service.ts
|   `-- recommendations.types.ts
|
|-- discovery/
|   |-- discovery.controller.ts
|   |-- discovery-picks.ts
|   |-- discovery.service.ts
|   |-- discovery.types.ts
|   `-- __tests__/
|
|-- watch-paths/
|   |-- watch-paths.controller.ts
|   |-- watch-paths.data.ts
|   |-- watch-paths-input.ts
|   |-- watch-paths.repository.ts
|   |-- watch-paths.service.ts
|   |-- watch-paths.types.ts
|   `-- __tests__/
|
|-- __tests__/
|-- progress.ts
|-- config.ts
|-- health.controller.ts
|-- legal.controller.ts
|-- prisma.service.ts
|-- root.controller.ts
`-- app.module.ts
```

The rule is:

```text
Controller -> Service / use case -> Repository or provider -> external system
```

For example, `GET /users/me` and `PATCH /users/me` are split as:

- `UsersController`: HTTP route only.
- `UsersService`: validates user setting input and orchestrates authenticated-user resolution and persistence.
- `SupabaseAuthService`: validates Supabase bearer tokens.
- `UsersRepository`: owns Prisma upsert and user-profile update logic.
- `user-profile.ts`: pure display-name logic with unit tests.

`GET /search` follows the same shape:

- `CatalogController`: HTTP route only.
- `CatalogService`: validates the Supabase bearer token through `UsersService`, parses search input, and coordinates search.
- `CatalogRepository`: owns catalog persistence and existing TVLore ID lookups.
- `TmdbClient`: owns TMDB HTTP calls and provider error mapping.
- `catalog-search.ts`: pure query/result normalization with unit tests.
- `catalog-resolve.ts`: pure resolve input/detail normalization with unit tests.
- `catalog-detail.ts`: pure route/detail normalization with unit tests.
- `catalog-watch-providers.ts`: pure country validation and TMDB watch-provider normalization with unit tests.

Watchlist follows the same shape:

- `ShowWatchlistController` and `MovieWatchlistController`: HTTP routes for saved intent.
- `WatchlistService`: resolves the authenticated TVLore user and validates route IDs.
- `WatchlistRepository`: owns idempotent Prisma writes for show/movie watchlist rows.

Preferences follows the same shape:

- `ShowPreferencesController`, `MoviePreferencesController`, and `EpisodePreferencesController`: HTTP routes for explicit ratings.
- `PreferencesService`: resolves the authenticated TVLore user and validates route IDs plus 1-5 rating input.
- `PreferencesRepository`: owns idempotent Prisma writes for show/movie/episode preference rows.

Reflections follows the same shape:

- `ReflectionsController`: HTTP routes for post-watch check-ins on shows, movies, and episodes.
- `ReflectionsService`: resolves the authenticated TVLore user, validates UUIDs, and parses rating/reaction/favorite-character/comment input.
- `ReflectionsRepository`: writes the rating to the existing preference row and writes the richer reflection to a separate per-user/per-title table.

The separation is intentional: watched state answers "did the user watch this?",
rating preference answers "how much did the user like this?", and reflection
answers "what did the user feel or want to remember?". Keeping those rows
separate avoids coupling future rewatches, comments, spoilers, and recommendation
signals to one overloaded record.

Tracking follows the same shape:

- `EpisodeTrackingController`, `MovieTrackingController`, and `ShowTrackingController`: HTTP routes for watched state.
- `TrackingService`: resolves the authenticated TVLore user, validates IDs, and coordinates catalog hydration for full-show actions.
- `TrackingRepository`: owns idempotent Prisma writes for episode/movie watches and recalculates show progress after mutations.

Recommendations follow the same shape:

- `RecommendationsController`: HTTP route only.
- `RecommendationsService`: resolves the authenticated TVLore user, enriches final candidates with country-aware TMDB Watch Providers availability, and applies the TVLore recommendation score.
- `RecommendationsRepository`: reads existing ratings, watched state, watchlist rows, preferred genres, and hydrated catalog candidates.
- `recommendation-scoring.ts`: owns the pure scoring rule so ranking can be tested without Nest or Prisma wiring.
- The current MVP heuristic stays database-backed for candidate selection and only calls TMDB Watch Providers for the final recommendation items.

Discovery follows the same controller/service boundary:

- `DiscoveryController`: exposes contextual and editorial discovery routes.
- `DiscoveryService`: resolves the authenticated TVLore user and hydrates existing TVLore IDs for discovery rows.
- `discovery-picks.ts`: owns the first static TVLore editorial picks as TMDB refs and display metadata.

Watch Paths follow the same shape:

- `WatchPathsController`: HTTP route only.
- `WatchPathsService`: resolves the authenticated TVLore user, hydrates imported TMDB refs for user-owned paths, hydrates existing TVLore IDs for path items, and owns the bulk save-to-watchlist use case.
- `WatchPathsRepository`: persists user-owned paths and ordered user path items.
- `watch-paths.data.ts`: owns the first static curated paths and pure mapping helpers.
- Catalog identity flows through `POST /catalog/resolve` when the user opens a path item, or through the same catalog repository/provider path when the backend saves a full path.
- Saving a path uses existing show/movie watchlist tables; user-owned path definitions live in path-specific database rows.

## Layer Separation

### Controllers / Transport

Controllers:

- Parse route parameters and request bodies.
- Apply transport validation.
- Call application use cases.
- Return response DTOs.
- Stay thin.

Controllers must not contain business rules.

### Application Use Cases

Use cases coordinate work:

- Authenticate with Google.
- Resolve catalog items.
- Mark watched/unwatched.
- Calculate library summaries.
- Refresh tokens.

Use cases may orchestrate repositories, domain services, and adapters.

### Domain Logic

Domain logic owns rules:

- Tracking semantics.
- Progress calculation.
- Rewatch behavior.
- Ownership checks.
- Privacy decisions.
- Future match calculations.

Domain logic must be testable without HTTP.

### Repositories

Repositories isolate persistence:

- Query PostgreSQL.
- Persist entities.
- Enforce transactional boundaries where needed.
- Return domain/application models, not raw transport DTOs.

### Infrastructure

Infrastructure contains implementation details:

- Database client.
- Configuration.
- Logging.
- Request correlation.
- Auth guards.
- Rate limiting.

### Provider Integrations

Provider integrations isolate external APIs:

- TMDB client.
- TMDB response mapping.
- Provider error mapping.
- Retry/backoff rules where needed.

TMDB models must not leak into domain services or mobile contracts.

Provider hydration has a performance budget. Navigation-critical reads should
prefer lightweight provider data and already persisted TVLore rows. Heavy
hydration, such as full-show watched actions or large seasons, must be backed by
explicit user intent, batched persistence, and stable partial progress semantics
instead of one provider row producing one slow transactional write. If a provider
resource can be unexpectedly large, add a preflight/count step or progressive
hydration before making mobile wait for every row.

## Module Guidelines

- Keep modules cohesive.
- Avoid circular imports.
- Share only stable contracts or explicit providers.
- Put business rules near the domain they govern.
- Do not create a shared "utils" dumping ground.
- Prefer explicit dependencies.

## Transactions

Use transactions for operations that must stay consistent:

- Creating a user and user identity.
- Resolving a catalog entity plus external identifiers.
- Marking watched and returning updated progress.
- Deleting watch records and returning updated progress.
- Bulk-marking a season or full show watched/unwatched.
- Writing a rating plus its related post-watch reflection.
- Creating or importing a user-owned Watch Path plus ordered items.
- Saving every item in a Watch Path to watchlist.
- Deleting a TVLore account's private user-owned data.

## Authorization

Authorization is backend-owned.

Protected endpoints should resolve the authenticated TVLore user from the access token, then use server-side ownership checks for requested resources.

The client must not provide a `userId` for user-scoped actions.
