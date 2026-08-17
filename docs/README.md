# TVLore Documentation

TVLore is a mobile-first entertainment tracking product centered on a user's personal viewing history. It starts with TV shows, seasons, episodes, and movies, but the long-term product value is a taste profile that can help people discover what they share through the stories they watch.

The MVP goal is intentionally small: authenticate with Google, search catalog content, open show/movie details, mark episodes and movies watched or unwatched, show progress, and display a simple personal library/profile summary.

## Architecture at a Glance

- Mobile-first client: React Native, Expo, Expo Router, TypeScript.
- Backend: NestJS modular monolith, PostgreSQL, REST, TMDB adapter.
- Authentication: Supabase Auth with Google as the first identity provider.
- Shared contracts: TypeScript and Zod transport schemas only.
- Source of truth: the backend.
- Server state: TanStack Query.
- Global client state: Zustand only for genuine application/UI state.
- Sensitive credentials: Expo SecureStore.
- Provider catalog data: TMDB initially, isolated behind an adapter.
- Product identity: TVLore internal UUIDs, not provider IDs.

## Core Principles

> TVLore is mobile-first.

> The backend is the source of truth.

> The mobile application owns presentation, not domain behavior.

> Tracking data is first-party product data.

> External media providers provide catalog metadata, not product identity.

> TVLore owns its internal identifiers.

> TanStack Query owns server state.

> Zustand is not a client-side database.

> Sensitive credentials live in secure device storage.

> Social comparison should reveal derived insights rather than unnecessarily exposing raw user history.

> QR codes contain opaque references, never profile data.

> The MVP should remain simple.

> Future capabilities should influence boundaries, not inflate the MVP implementation.

## Reading Order

1. [Product Vision](product-vision.md)
2. [MVP Scope](mvp-scope.md)
3. [Current State](current-state.md)
4. [Architecture](architecture.md)
5. [Stack](stack.md)
6. [Domain Model](domain-model.md)
7. [Tracking Model](tracking-model.md)
8. [API Design](api-design.md)
9. [Mobile Architecture](mobile-architecture.md)
10. [Backend Architecture](backend-architecture.md)
11. [State Management](state-management.md)
12. [Authentication](authentication.md)
13. [Security](security.md)
14. [Social Vision](social-vision.md)
15. [TVLore Match](tvlore-match.md)
16. [Infrastructure Setup](infrastructure.md)
17. [Mobile Development Build](mobile-development-build.md)
18. [Release v1.0 Roadmap](release-v1-roadmap.md)
19. [Release Smoke Checklist](release-smoke-checklist.md)
20. [Roadmap](roadmap.md)
21. [Architecture Decision Records](adr/)

## Documentation Index

- [Architecture](architecture.md)
- [API Design](api-design.md)
- [Authentication](authentication.md)
- [Backend Architecture](backend-architecture.md)
- [Coding Rules](coding-rules.md)
- [Configuration](configuration.md)
- [Current State](current-state.md)
- [Diagrams](diagrams.md)
- [Domain Model](domain-model.md)
- [Error Handling](error-handling.md)
- [Glossary](glossary.md)
- [Infrastructure Setup](infrastructure.md)
- [Mobile Architecture](mobile-architecture.md)
- [Mobile Development Build](mobile-development-build.md)
- [MVP Scope](mvp-scope.md)
- [Observability](observability.md)
- [Privacy](privacy.md)
- [Product Vision](product-vision.md)
- [Release v1.0 Roadmap](release-v1-roadmap.md)
- [Release Smoke Checklist](release-smoke-checklist.md)
- [Roadmap](roadmap.md)
- [Security](security.md)
- [Social Vision](social-vision.md)
- [Stack](stack.md)
- [State Management](state-management.md)
- [Testing Strategy](testing-strategy.md)
- [TMDB Integration](tmdb-integration.md)
- [Tracking Model](tracking-model.md)
- [TVLore Match](tvlore-match.md)

## ADR Index

- [001 - Mobile Stack](adr/001-mobile-stack.md) - Accepted
- [002 - Backend Modular Monolith](adr/002-backend-modular-monolith.md) - Accepted
- [003 - State Management](adr/003-state-management.md) - Accepted
- [004 - Authentication](adr/004-authentication.md) - Accepted
- [005 - Access and Refresh Token Strategy](adr/005-access-refresh-token-strategy.md) - Accepted
- [006 - Media Provider TMDB](adr/006-media-provider-tmdb.md) - Accepted
- [007 - Database ORM](adr/007-database-orm.md) - Accepted
- [008 - Catalog Persistence](adr/008-catalog-persistence.md) - Accepted
- [009 - Shared Contracts](adr/009-shared-contracts.md) - Accepted
- [010 - Tracking Model](adr/010-tracking-model.md) - Accepted
- [011 - Internal vs Provider Identifiers](adr/011-internal-vs-provider-identifiers.md) - Accepted
- [012 - Future Social Match Boundary](adr/012-future-social-match-boundary.md) - Proposed

## Current Architecture Status

This documentation started as the Phase 0 architecture baseline. The repository now also contains the initial monorepo, NestJS API, Expo mobile app, Prisma schema, Vercel deploy setup, Supabase infrastructure baseline, TMDB catalog search/resolve, and Postman collection.

Accepted decisions are stable enough for the first implementation pass. Proposed decisions should influence boundaries but should be revisited before implementation of the related feature. See [Current State](current-state.md) for the implemented flows and [Infrastructure Setup](infrastructure.md) for the deployed state.

## Unresolved Decisions

- Exact production Supabase Auth policy settings.
- Whether poster/backdrop images are proxied, cached, or loaded directly from TMDB image URLs.
- Whether provider identifiers start as direct columns or an `ExternalIdentifier` table in the very first migration.
- Exact rate-limit thresholds.
- Final branding around "Lore", "My Lore", and "Taste Profile".
- Future TVLore Match scoring formula.

## Prompt Question Map

1. What is TVLore? See [Product Vision](product-vision.md).
2. What makes it different from a generic tracker? See [Product Vision](product-vision.md) and [Social Vision](social-vision.md).
3. What is actually part of the MVP? See [MVP Scope](mvp-scope.md).
4. What is deliberately postponed? See [MVP Scope](mvp-scope.md) and [Roadmap](roadmap.md).
5. Why React Native + Expo? See [Stack](stack.md) and [ADR 001](adr/001-mobile-stack.md).
6. Why NestJS? See [Stack](stack.md), [Backend Architecture](backend-architecture.md), and [ADR 002](adr/002-backend-modular-monolith.md).
7. Why PostgreSQL? See [Stack](stack.md) and [ADR 007](adr/007-database-orm.md).
8. Which layer owns business logic? See [Architecture](architecture.md).
9. Which layer owns server state? See [State Management](state-management.md).
10. When do we use Zustand? See [State Management](state-management.md).
11. Where are credentials stored? See [Authentication](authentication.md) and [Security](security.md).
12. How does Google authentication work? See [Authentication](authentication.md).
13. How does token refresh work? See [Authentication](authentication.md).
14. How is TMDB isolated? See [TMDB Integration](tmdb-integration.md).
15. How do TVLore IDs differ from provider IDs? See [Domain Model](domain-model.md).
16. When do catalog records enter PostgreSQL? See [TMDB Integration](tmdb-integration.md) and [ADR 008](adr/008-catalog-persistence.md).
17. How is an episode watch represented? See [Tracking Model](tracking-model.md).
18. How is a movie watch represented? See [Tracking Model](tracking-model.md).
19. How is progress calculated? See [Tracking Model](tracking-model.md).
20. How can the tracking model support future user comparisons? See [Tracking Model](tracking-model.md) and [TVLore Match](tvlore-match.md).
21. What information could a future TVLore Match reveal? See [TVLore Match](tvlore-match.md).
22. How does QR sharing remain private? See [TVLore Match](tvlore-match.md) and [Privacy](privacy.md).
23. Why is matching backend-owned? See [Architecture](architecture.md), [Privacy](privacy.md), and [TVLore Match](tvlore-match.md).
24. What should the first implementation task be? See [Roadmap](roadmap.md).
