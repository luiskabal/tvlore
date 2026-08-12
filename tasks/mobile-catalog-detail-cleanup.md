# Mobile Catalog Detail Cleanup

Status: Implemented

## Goal

Split catalog detail route/container logic from detail presentation and styles
without changing behavior.

## Context

Current files:

- `apps/mobile/src/catalog/CatalogDetailScreen.tsx`
- `apps/mobile/src/catalog/CatalogDetailContent.tsx`
- `apps/mobile/src/catalog/catalog-detail-styles.ts`

The old `CatalogDetailScreen` mixed route params, loading/error branches, hero
layout, movie watch panel, show season rows, formatting helpers, and styles.

## Requirements

- Keep `CatalogDetailScreen` as the route/container.
- Move hero/detail UI, movie watch panel, show seasons list, and formatting helpers into presentation code.
- Move styles into a dedicated style module.
- Keep movie watch/unwatch and season navigation behavior unchanged.

## Acceptance Criteria

- TypeScript compiles.
- Movie detail still supports watched/unwatched.
- Show detail still opens season detail.
- Loading/error/ready behavior remains unchanged.

## Verification

```powershell
corepack pnpm verify
```

## Out of Scope

- UI redesign.
- New backend endpoints.
- Skeletons for detail screens.

## Human Gates

- None.
