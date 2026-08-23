# Mobile UI System

This document maps the reusable mobile UI pool that currently exists in
`apps/mobile/src/ui` and the rules for extending it without mixing domain logic,
styles, and API behavior back into the same file.

## Purpose

The mobile app is already functional. The next UI work should make it feel more
like a polished product while preserving the current boundary:

```text
Route screen -> hook/model -> API/auth client
Route screen -> feature UI -> shared UI primitive
```

Shared UI components are presentation-only. They should not fetch data, inspect
Supabase sessions, call TVLore endpoints, calculate progress, resolve catalog
identity, or decide whether a user can perform a domain action.

## Visual Foundation

`apps/mobile/src/ui/tokens.ts` is the current design token source:

| Token group | Current responsibility |
| --- | --- |
| `ui.color` | App ink, muted copy, accent green, danger, panels, borders, skeleton colors. |
| `ui.radius` | Small, medium, and pill radius values. |
| `ui.space` | Shared spacing steps for rows, panels, buttons, and screen gaps. |
| `ui.type` | Body, button, label, row title, section title, and stat sizes. |

The palette is intentionally warm and restrained: off-white surfaces, dark ink,
green actions, and red only for destructive or failed states.

## Component Layers

### Atoms

Atoms are the smallest reusable pieces. They know about visual treatment, not
product state.

| Component | Responsibility |
| --- | --- |
| `AppText` | Typography variants and tone mapping. |
| `Badge` | Compact labels such as media type, status, or category. |
| `Button` | Text and optional icon actions with primary, secondary, outline, and danger variants. |
| `IconButton` | Icon-only actions with accessibility labels. |
| `BackButton` | Small back affordance used by detail routes. |
| `Skeleton` | Generic loading block. |
| `PosterImage` | Poster frame plus placeholder fallback. |
| `StillImage` | Episode/still frame plus placeholder fallback. |
| `RatingStars` | 1-5 star picker for show, movie, and episode rating. |

### Molecules

Molecules compose atoms into reusable interaction shapes.

| Component | Responsibility |
| --- | --- |
| `Surface` | Standard framed content panel. |
| `StatCard` | Tappable numeric summary card used as Library section filters. |
| `SegmentedControl` | Search and filter tabs that ignore taps on the already-selected option. |
| `MediaRow` | Tappable poster/title/detail row used by list screens. |
| `MediaRowSkeleton` | Loading shape for `MediaRow`. |
| `CalloutRow` | Icon-led navigation row for discovery entry points. |
| `EmptyState` | Standard empty panel with optional action. |
| `PageHeader` | Screen title, subtitle, and optional action slot. |
| `Screen`, `ScreenContent`, `ScreenScroll` | Safe area, scroll, width, padding, and tablet max-width baseline. |

### Composed Surfaces

Feature folders own composed surfaces because those surfaces know the product
context.

| Folder | Current composed surfaces |
| --- | --- |
| `home` | Holo profile card, Library overview sections, recommendation panel. |
| `library` | Cronologia, continue watching, grouped episodes, watchlist/rated/removable rows. |
| `search` | Search controls, result rows, discovery entry cards, recommendation/discovery list screens. |
| `catalog` | Show/movie detail, season detail, episode detail, tracking panels, post-watch check-in. |
| `watch-paths` | Path list, path detail, import/create controls. |
| `profile` | Identity, country preference, legal/account actions. |
| `navigation` | Bottom tab bar and route transition behavior. |

## Styling Boundary

Use this rule when adding or moving styles:

```text
Generic visual pattern -> apps/mobile/src/ui/*
Feature-specific layout -> apps/mobile/src/<feature>/*-styles.ts
Screen orchestration -> route screen/component file
Pure list/section shaping -> *-model.ts
Server or auth state -> use-* hook and API/auth client
```

Examples:

- A reusable card container belongs in `Surface`.
- A show-specific tracking panel belongs in `catalog`.
- A chronological grouping algorithm belongs in `library/*-model.ts`.
- A Supabase token lookup belongs in a hook or auth client, not a row component.

## Interaction Rules

- Rows that primarily navigate should be tappable rows, not rows with an `Open`
  button.
- Icon-only actions must have `accessibilityLabel`.
- Mutation actions should be explicit. Avoid ambiguous status-only controls for
  important actions such as watched/unwatched.
- Watchlist stays a compact title-level action. Watched state lives in explicit
  tracking UI.
- Rating uses `RatingStars`, not numbered buttons.
- Post-watch check-in order is: rating, emotion, favorite character, optional
  comment.
- Reversible list removals use the two-step swipe confirmation pattern.
- Tapping an already-selected tab or segmented option should not trigger a route
  animation or redundant request.

## Loading And Performance UI

Loading states should match the shape of the final content.

| Pattern | Current standard |
| --- | --- |
| First load | Render content-shaped skeletons. |
| Refresh after data exists | Keep the last ready snapshot visible and show a small updating affordance. |
| Slow search/filter request | Clear stale mismatched result lists into skeleton rows only when the visible filter/query changes. |
| Long lists | Load progressively as the user scrolls. |
| Likely next tap | Use lightweight read prefetch only. |
| Mutations | Use optimistic UI when rollback is clear, then reconcile from the backend response. |

Do not prefetch write endpoints such as `POST /catalog/resolve`. A prefetch may
warm cheap reads, but it should not create catalog identity or hydrate huge
provider payloads before the user asks for them.

## Navigation Rules

The bottom app navigation is a persistent shell with icon plus label:

```text
Library <-> Search <-> Paths <-> Profile
```

Route direction should feel spatial:

- Moving to a tab on the right animates from right to left.
- Moving to a tab on the left animates from left to right.
- Pressing the active tab does nothing.
- Secondary and detail routes keep the last active tab visible and use stack
  navigation.
- Secondary/detail routes support edge-pan back from either screen edge. This
  intentionally maps only to the existing back stack; forward gestures need a
  real forward-history model before they should be added.

## Responsive Baseline

`ScreenContent` and `ScreenScroll` currently provide:

- Safe area handling.
- Narrow-phone horizontal padding.
- Wider-phone horizontal padding.
- A tablet-ish `maxWidth` once the viewport reaches 760px.

This is enough for v1.0 phone-first testing. Tablet refinement is a later polish
task, not a release blocker unless Play testing exposes broken layout.

## When To Extract A New UI Component

Extract to `src/ui` only when at least one of these is true:

1. The pattern is already repeated in two feature folders.
2. The pattern has accessibility behavior that should be consistent everywhere.
3. The pattern has loading/fallback behavior that must stay aligned with final
   content.
4. The pattern is part of the product's visual identity.

If the component name contains a domain noun such as `Show`, `Episode`,
`Watchlist`, `Recommendation`, or `Path`, it probably belongs in a feature
folder instead.

## Known UI Debt

- Skeletons need periodic visual checks against final loaded rows after each
  major UI change.
- Accessibility labels exist for key icon actions, but a full accessibility
  audit is still pending.
- Hit targets and press feedback should be reviewed on small Android devices.
- The token set is code-only. There is no Figma/token library yet.
- Dark mode is deferred.
- Tablet layout is supported conservatively but not polished.
- Favorite-character vote percentages are backlog, not implemented.

## Adding A New UI Pattern

1. Check `src/ui` first.
2. Reuse tokens before adding raw colors, font sizes, or spacing.
3. Keep domain logic out of the shared component.
4. Put feature-specific styles in the feature's `*-styles.ts`.
5. Add a skeleton that matches the final layout if the component is loaded from
   the network.
6. Test on a narrow phone and a larger viewport before calling the UI done.

## Current Guiding Principle

Polish should reduce cognitive load:

```text
Less text when an icon plus label is clearer.
Less waiting when previous data or skeletons can preserve context.
Less guessing when actions are named by the user intent.
Less duplicated styling when a shared primitive already exists.
```
