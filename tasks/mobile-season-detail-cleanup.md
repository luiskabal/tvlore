# Mobile Season Detail Cleanup

Status: Implemented

## Goal

Split season detail route/container logic from season presentation and styles
without changing behavior.

## Context

Current files:

- `apps/mobile/src/catalog/SeasonDetailScreen.tsx`
- `apps/mobile/src/catalog/SeasonContent.tsx`
- `apps/mobile/src/catalog/season-detail-styles.ts`

The old `SeasonDetailScreen` mixed route params, loading/error branches, bulk
season actions, episode rows, formatting helpers, and styles in one file.

## Requirements

- Keep `SeasonDetailScreen` as the route/container.
- Move season header, bulk actions, episode list, episode row, and formatting helpers into presentation code.
- Move styles into a dedicated style module.
- Keep existing watch/unwatch and bulk behavior unchanged.

## Acceptance Criteria

- TypeScript compiles.
- Season loading/error/ready behavior remains unchanged.
- Episode watched/unwatched controls still call the same hook callbacks.
- Bulk season actions still call the same hook callback.

## Verification

```powershell
corepack pnpm verify
```

## Out of Scope

- UI redesign.
- Backend bulk endpoint.
- Skeletons for season detail.

## Human Gates

- None.
