# 009 - Shared Contracts

## Status

Accepted

## Context

Both mobile and backend are TypeScript. Shared request/response contracts can reduce drift, but sharing too much can couple mobile to backend internals.

## Decision

Create `packages/contracts` for:

- Request schemas.
- Response schemas.
- Zod transport schemas.
- TypeScript DTO types.
- Enums.
- API error contracts.

Do not put backend domain services, business policies, repositories, use cases, progress calculations, match calculations, or authorization rules in shared contracts.

## Alternatives Considered

- No shared package: lower coupling, but higher DTO drift risk.
- Share backend domain models directly: convenient, but leaks backend internals and business behavior.
- Generate clients from OpenAPI only: useful later, but heavier for the first implementation.

## Consequences

- Mobile and backend agree on transport shape.
- Business behavior remains backend-owned.
- Contract package must stay small and boring.
- Zod is used for structural validation, not domain authorization.

