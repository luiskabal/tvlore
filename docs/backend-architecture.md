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
|-- library/
|
`-- integrations/
    `-- tmdb/
```

Future modules may include:

```text
ratings/
social/
matches/
recommendations/
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
|   `-- supabase-auth.service.ts
|
|-- users/
|   |-- users.controller.ts
|   |-- users.service.ts
|   |-- users.repository.ts
|   |-- users.types.ts
|   `-- user-profile.ts
|
|-- catalog/
|   |-- catalog.controller.ts
|   |-- catalog-detail.ts
|   |-- catalog.repository.ts
|   |-- catalog-resolve.ts
|   |-- catalog.service.ts
|   |-- catalog-search.ts
|   |-- catalog.types.ts
|   `-- tmdb-client.ts
|
|-- config.ts
|-- prisma.service.ts
`-- app.module.ts
```

The rule is:

```text
Controller -> Service / use case -> Repository or provider -> external system
```

For example, `GET /users/me` is split as:

- `UsersController`: HTTP route only.
- `UsersService`: orchestrates authenticated-user resolution and persistence.
- `SupabaseAuthService`: validates Supabase bearer tokens.
- `UsersRepository`: owns Prisma upsert logic.
- `user-profile.ts`: pure display-name logic with unit tests.

`GET /search` follows the same shape:

- `CatalogController`: HTTP route only.
- `CatalogService`: validates the Supabase bearer token through `UsersService`, parses search input, and coordinates search.
- `CatalogRepository`: owns catalog persistence and existing TVLore ID lookups.
- `TmdbClient`: owns TMDB HTTP calls and provider error mapping.
- `catalog-search.ts`: pure query/result normalization with unit tests.
- `catalog-resolve.ts`: pure resolve input/detail normalization with unit tests.
- `catalog-detail.ts`: pure route/detail normalization with unit tests.

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
- Refresh-token rotation.
- Resolving a catalog entity plus external identifiers.
- Marking watched and returning updated progress.
- Deleting watch records and returning updated progress.

## Authorization

Authorization is backend-owned.

Protected endpoints should resolve the authenticated TVLore user from the access token, then use server-side ownership checks for requested resources.

The client must not provide a `userId` for user-scoped actions.
