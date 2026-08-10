# Architecture

TVLore uses a mobile-first monorepo with a React Native mobile app, a NestJS API, shared transport contracts, and documentation.

Conceptual structure:

```text
/
|-- apps/
|   |-- mobile/
|   `-- api/
|
|-- packages/
|   `-- contracts/
|
`-- docs/
```

Future applications may be added later:

```text
apps/
|-- mobile/
|-- api/
|-- web/      # future
`-- admin/    # future
```

Do not create future apps until there is a concrete need.

## Fundamental Rule

The backend is the source of truth.

The mobile client may contain:

- UI logic.
- Presentation logic.
- Navigation logic.
- Structural input validation.
- Form validation.
- Local interactions.
- Loading/error presentation.
- Device-specific behavior.
- Temporary UI state.

The backend must contain:

- Business rules.
- Authorization.
- Resource ownership.
- Tracking rules.
- Progress calculation.
- Rewatch semantics.
- State transitions.
- Data consistency.
- Provider orchestration.
- Persistence rules.
- Privacy rules.
- Future matching logic.
- Future compatibility calculations.

Deleting the React Native application must not delete any business behavior.

## Boundary Test

Use this test:

> If another future client would need the same rule, the rule belongs in the backend.

This matters because future clients may include web, native iOS, native Android, Apple TV, Android TV, public API, or internal admin tools.

## Layer Responsibilities

### Mobile

- Render screens.
- Navigate between routes.
- Collect user input.
- Display loading, empty, success, and error states.
- Call query hooks and mutations.
- Store sensitive auth material in SecureStore.
- Store non-sensitive preferences in AsyncStorage.
- Never store TMDB credentials.
- Never decide authorization or ownership.
- Never calculate canonical progress.

### API

- Authenticate users.
- Authorize actions.
- Own business rules.
- Resolve internal IDs.
- Isolate TMDB.
- Persist TVLore-owned data.
- Calculate progress.
- Return consistent contracts and errors.
- Enforce privacy.

### Contracts Package

- Share request and response schemas.
- Share DTO types and enums.
- Share error contract types.
- Validate transport shape.
- Avoid domain services, repositories, policies, and calculations.

### PostgreSQL

- Persist TVLore-owned identity, tracking, and catalog reference data.
- Enforce uniqueness and ownership constraints.
- Support durable watch history.
- Provide an integrity boundary in addition to backend validation.

### TMDB

- Provide external catalog metadata.
- Remain behind backend adapters.
- Never define TVLore product identity.

## Modular Monolith

The backend should start as a modular monolith. Modules should be cohesive and internally well-separated, but deployed as one API application.

This avoids premature distributed-system complexity while keeping future extraction possible if real operational pressure appears.

Do not introduce microservices, Redis, Kafka, queues, event streaming, Kubernetes, service mesh, GraphQL, CQRS frameworks, or event sourcing for the MVP.

## Trust Model

The mobile app is an untrusted client. It can be modified, replayed, or run on compromised devices.

Therefore:

- The backend verifies Google credentials.
- The backend resolves the authenticated TVLore user.
- The backend validates ownership and authorization.
- The backend decides what data may be returned.
- The backend calculates derived values.
- QR/deep links contain opaque references only.

See [Security](security.md), [Privacy](privacy.md), and [Diagrams](diagrams.md).

