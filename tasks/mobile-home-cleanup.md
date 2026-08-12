# Mobile Home Cleanup

Status: Implemented

## Goal

Make the mobile home screen easier to maintain by separating container logic,
library presentation, and styles without changing behavior.

## Context

Current file:

- `apps/mobile/src/home/HomeScreen.tsx`

Current architecture boundary:

```text
Screen -> hook -> API/auth client
```

The home screen currently mixes route/auth wiring, library rendering helpers,
formatting helpers, and styles in one file.

## Requirements

- Keep existing home behavior unchanged.
- Keep `HomeScreen` responsible for hooks, refresh wiring, auth actions, and navigation.
- Move library presentation into a dedicated home component file.
- Move styles into a dedicated style module.
- Do not add dependencies or a new state-management layer.

## Acceptance Criteria

- Home still shows title, subtitle, library summary, auth panel, refresh button, and API status.
- Signed-in users can still navigate to search.
- The library still refreshes after tracking changes.
- TypeScript compiles.

## Verification

```powershell
corepack pnpm verify
```

## Out of Scope

- UX redesign.
- New Library/Profile routes.
- Search/detail cleanup.
- New state-management libraries.

## Human Gates

- None for this refactor.
