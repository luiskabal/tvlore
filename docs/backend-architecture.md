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

