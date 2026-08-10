# 008 - Catalog Persistence

## Status

Accepted

## Context

TVLore depends on TMDB for catalog metadata, but user watch history needs durable internal references. Mirroring the entire TMDB catalog would add unnecessary complexity.

## Decision

Persist catalog entities only when a user interacts with or resolves them.

Search can return provider-backed results with external refs. When the user opens a detail page or tracks an item, the backend resolves the provider item and creates or updates internal TVLore records.

## Alternatives Considered

- Always proxy TMDB without persistence: simplest, but watch history would reference provider identity.
- Persist on interaction: supports durable TVLore IDs without mirroring everything.
- Local catalog mirror: powerful but operationally too large for MVP.

## Consequences

- Search results may contain provider refs before an internal ID exists.
- `POST /catalog/resolve` turns a provider ref into a TVLore ID.
- Watch records always reference internal TVLore entities.
- Metadata freshness is handled opportunistically.
- No background catalog sync is required for MVP.

