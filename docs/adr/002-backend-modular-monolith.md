# 002 - Backend Modular Monolith

## Status

Accepted

## Context

TVLore needs authentication, catalog integration, tracking, progress calculation, and future privacy/match behavior. These domains need clear boundaries, but the product does not yet need distributed systems.

## Decision

Use a NestJS modular monolith.

Initial modules:

- `auth`
- `users`
- `catalog`
- `tracking`
- `library`
- `integrations/tmdb`

Future modules may include `ratings`, `social`, `matches`, `recommendations`, and `notifications`.

## Alternatives Considered

- Microservices: unnecessary operational complexity for MVP.
- Serverless functions only: possible, but weaker fit for cohesive domain modules and transactions at this stage.
- GraphQL backend: unnecessary for the initial mobile API surface.
- CQRS/event-sourcing frameworks: premature for simple tracking commands and reads.

## Consequences

- Backend business rules remain centralized.
- Modules can be tested independently.
- Future extraction remains possible if scale or team boundaries justify it.
- The deployment model stays simple.
- Controllers must remain thin; domain behavior belongs in use cases/domain services.

## References

- https://docs.nestjs.com/
- https://docs.nestjs.com/techniques/database

