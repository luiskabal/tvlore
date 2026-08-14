# Mobile Server-State Decision

Status: Decided

## Goal

Decide whether TVLore mobile should keep local server-state hooks or adopt a
query library now.

## Context

Current mobile boundary:

```text
Screen -> hook -> API/auth client
```

Current server-state hooks include:

- `useHomeData`
- `useHomeModel`
- `useCatalogSearch`
- `useCatalogDetail`
- `useSeasonDetail`

The app already has manual invalidation for Library/Profile through
`library-refresh.ts`.

## Decision

Keep local hooks for now.

## Why

- The app has a small number of server-state surfaces.
- The current invalidation model is understandable.
- Search already has custom debounce and stale-response protection.
- Detail screens need simple request state, not shared cache behavior yet.
- Adding a query library now would add dependency and concepts before the app
  has enough cache complexity to justify it.

## Revisit When

- Watchlist introduces repeated shared state across Library, Search, Profile,
  show detail, and movie detail.
- We need stale-time, background refetch, retry policy, or request deduplication
  in more than one hook.
- Manual invalidation starts spreading across unrelated files.

## Acceptance Criteria

- No dependency added.
- Existing `Screen -> hook -> API/auth client` boundary remains.
- Future query-library adoption has an explicit trigger.

## Verification

No runtime verification required; this is a documentation decision.

## Out of Scope

- Installing TanStack Query.
- Refactoring existing hooks.
- Changing API contracts.

## Human Gates

- None.
