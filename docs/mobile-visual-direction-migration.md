# Mobile Visual Direction Migration

Date: 2026-08-27

This document captures the first audit and migration checkpoint for evolving the
TVLore mobile app toward the supplied cinematic visual references. No product
behavior, API contracts, auth flow, or backend ownership should change as part
of the visual migration unless a later task explicitly requires it.

Reference images live in `docs/images`. They are visual direction, not
pixel-perfect implementation requirements.

## Current UI Architecture

The mobile app already has the right structural boundary for a visual migration:

```text
Route screen -> feature component -> shared UI primitive
Route screen -> hook -> API/auth client
```

Important current files:

| Area | Current files |
| --- | --- |
| Router shell | `apps/mobile/app/_layout.tsx` |
| Primary tabs | `apps/mobile/src/navigation/AppTabBar.tsx`, `apps/mobile/src/navigation/app-tabs.ts`, `apps/mobile/src/navigation/app-tab-bar-styles.ts` |
| Shared UI primitives | `apps/mobile/src/ui/*` |
| Library/Home surface | `apps/mobile/src/library/LibraryScreen.tsx`, `apps/mobile/src/home/*` |
| Search/discovery | `apps/mobile/src/search/*` |
| Detail/tracking/check-in | `apps/mobile/src/catalog/*` |
| Watch Paths | `apps/mobile/src/watch-paths/*` |
| Profile | `apps/mobile/src/profile/ProfileScreen.tsx`, `apps/mobile/src/home/HoloProfileCard.tsx` |

`apps/mobile/src/ui/tokens.ts` is the current token source, but it is still a
legacy warm/light palette: cream surfaces, green accent, dark ink, and visible
borders. Several newer screens already consume these tokens, while
`apps/mobile/src/home/home-styles.ts` still contains many raw literal colors.

The API already exposes `backdropPath` for movie and show details, so cinematic
detail heroes can be a future client presentation change without changing the
backend contract.

## Reference Direction

The supplied mockups point to this product language:

- Near-black app chrome.
- Artwork-led color, especially posters and backdrops.
- Purple used as an accent for selected, active, followed, saved, and progress
  states.
- Muted gray inactive iconography and metadata.
- Compact elevated cards with subtle borders.
- Detail pages led by large backdrop images with dark vertical overlays.
- Bottom navigation that is present but visually quiet.
- Personal ratings in purple, public aggregate ratings in gold.
- Where to Watch grouped into Stream, Rent, and Buy rows.

Avoid:

- A generic Material Design look.
- Bright outlines.
- Green as the primary brand accent.
- Purple everywhere.
- Heavy glow, glassmorphism, or cyberpunk styling.
- Fake data or unsupported features to match a mockup.

## Gap Analysis

| Current | Reference direction | Proposed change |
| --- | --- | --- |
| Light cream background and panels | Dark cinematic foundation | Replace token values and component defaults with dark semantic tokens |
| Flat legacy tokens such as `ui.color.accent` and `ui.color.panel` | Semantic groups such as background, surface, text, accent, border | Expand tokens, optionally keep compatibility aliases during migration |
| Green accent across buttons, icons, ratings, selected states | Purple as active/product accent | Move active UI to purple tokens |
| Dark text on light surfaces | Near-white text on dark surfaces | Update `AppText`, inputs, buttons, and feature text styles |
| Large 42-44px page headers | Strong but calmer 28-36px hierarchy | Tune `PageHeader` and typography scale |
| Cards and rows have bright panels and visible borders | Elevated dark cards with subtle borders | Refactor `Surface`, `MediaRow`, `CalloutRow`, `StatCard`, skeletons, and badges |
| Bottom nav active state uses dark text and top rail | Purple icon plus label on near-black bar | Restyle `AppTabBar` and tab safe-area background |
| First tab is currently `Library`; refs show `Home` | Reference home is a content dashboard | Preserve current route behavior in Phase 1; decide label separately |
| Search is search-box first with discovery callout rows | Discovery destination with poster rails | Phase 2 screen pass using real existing discovery data |
| Detail hero is poster plus text | Backdrop-led cinematic hero | Phase 3 detail pass using existing `backdropPath` |
| Where to Watch renders compact provider icon pills | Grouped provider rows by Stream/Rent/Buy | Phase 3 visual pass; do not show price unless API provides it |
| Watch Paths are plain ordered rows | Distinctive ordered progress/path identity | Phase 4 visual pass after shared foundation |
| Profile uses a lively holo card | Calmer premium cinematic profile surface | Phase 4 cleanup unless it blocks consistency |

## Proposed Design Tokens

Target semantic shape:

```ts
export const ui = {
  color: {
    background: {
      primary: "#050811",
      secondary: "#080D18",
      elevated: "#0D1420",
    },
    surface: {
      card: "#101722",
      cardElevated: "#141C29",
      overlay: "rgba(5, 8, 17, 0.82)",
    },
    border: {
      subtle: "#1B2433",
      strong: "#283246",
    },
    accent: {
      primary: "#8B4DFF",
      bright: "#A855F7",
      soft: "#B56CFF",
      dark: "#5B21B6",
      surface: "rgba(139, 77, 255, 0.12)",
      border: "rgba(168, 85, 247, 0.35)",
    },
    text: {
      primary: "#F7F7FA",
      secondary: "#A7ADBA",
      tertiary: "#737B8C",
      disabled: "#4E5665",
      inverse: "#050811",
    },
    rating: {
      star: "#FFB800",
    },
    status: {
      success: "#7C5CFF",
      danger: "#EF5350",
    },
  },
  radius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
    pill: 999,
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  type: {
    display: 34,
    screenTitle: 30,
    sectionTitle: 22,
    cardTitle: 17,
    body: 16,
    metadata: 14,
    label: 12,
  },
};
```

Phase 1 can keep short compatibility aliases such as `ui.color.accent` and
`ui.color.panel` only if that keeps the change small. New and touched code
should use the semantic groups.

## Components To Reuse Or Refactor

Start with existing primitives:

- `Screen`, `ScreenContent`, `ScreenScroll`
- `AppText`
- `Surface`
- `Button`
- `IconButton`
- `BackButton`
- `Badge`
- `CalloutRow`
- `EmptyState`
- `SegmentedControl`
- `MediaRow`
- `PosterImage`
- `StillImage`
- `RatingStars`
- `Skeleton`
- `StatCard`
- `PageHeader`
- `AppTabBar`

Do not add broad new components during Phase 1. Add poster rails, backdrop hero
sections, provider rows, or watch-path progress components only when the related
screen phase needs them and the pattern is real.

## Screens Ranked By Visual Impact

1. Movie and show detail.
2. Library/Home surface.
3. Search/discovery.
4. Watchlist rows inside Library.
5. Season and episode tracking.
6. Where to Watch.
7. Ratings and check-ins.
8. Watch Paths.
9. Profile.

## Risks

- Renaming the first tab from `Library` to `Home` may change product meaning.
  Current routing sends `/` to `/library`, and Library is the signed-in home
  surface. Keep behavior stable unless the label change is approved.
- A dark token swap will expose any remaining raw light colors quickly,
  especially in `home-styles.ts` and `app/auth/callback.tsx`.
- Detail backdrops need careful image sizing and overlays so text remains
  readable on small phones.
- Where to Watch references show prices, but current mobile provider types do
  not include price. Do not fabricate price UI.
- The app uses `@expo/vector-icons/Ionicons`; keep that icon language unless a
  separate design-system task replaces it.
- Do not add a gradient dependency in Phase 1 unless an implemented screen
  requires it. Backdrop gradients belong naturally with the Phase 3 detail pass.

## Migration Plan

### Phase 1 - Foundations

- Create/expand semantic design tokens.
- Retune shared typography, spacing, radius, surfaces, buttons, badges,
  segmented controls, rows, skeletons, rating stars, and empty states.
- Restyle bottom navigation to match the dark, quiet, purple-active reference.
- Replace the most visible raw old colors that would clash immediately.
- Preserve all routes, hooks, API calls, auth behavior, and user data behavior.

### Phase 2 - Library/Home And Discovery

- Make Library feel more like the reference Home surface while preserving
  existing user-owned sections.
- Improve Search as a discovery destination using existing real data:
  `TVLore Picks`, recommendations, available, popular, and catalog search.
- Introduce poster-led rails only where existing data supports them.

### Phase 3 - Detail, Episodes, Where To Watch

- Add cinematic movie/show backdrop heroes with dark overlay.
- Improve show detail tabs/sections without changing backend behavior.
- Make season and episode rows compact and artwork-led.
- Convert Where to Watch from provider icon pills into grouped provider rows.

### Phase 4 - Ratings, Watch Paths, Profile

- Make personal ratings/check-ins central and visually distinct from public
  aggregate ratings.
- Give Watch Paths a path/progress identity while keeping backend-owned order.
- Calm the Profile surface so it fits the premium dark system.

## Phase 1 Expected Files

```text
apps/mobile/src/ui/tokens.ts
apps/mobile/src/ui/AppText.tsx
apps/mobile/src/ui/Screen.tsx
apps/mobile/src/ui/Surface.tsx
apps/mobile/src/ui/Button.tsx
apps/mobile/src/ui/IconButton.tsx
apps/mobile/src/ui/BackButton.tsx
apps/mobile/src/ui/Badge.tsx
apps/mobile/src/ui/CalloutRow.tsx
apps/mobile/src/ui/EmptyState.tsx
apps/mobile/src/ui/SegmentedControl.tsx
apps/mobile/src/ui/MediaRow.tsx
apps/mobile/src/ui/PosterImage.tsx
apps/mobile/src/ui/StillImage.tsx
apps/mobile/src/ui/RatingStars.tsx
apps/mobile/src/ui/Skeleton.tsx
apps/mobile/src/ui/StatCard.tsx
apps/mobile/src/ui/PageHeader.tsx
apps/mobile/src/navigation/AppTabBar.tsx
apps/mobile/src/navigation/app-tab-bar-styles.ts
apps/mobile/src/home/home-styles.ts
apps/mobile/src/home/RecommendationsPanel.tsx
apps/mobile/src/search/search-styles.ts
apps/mobile/src/catalog/catalog-detail-styles.ts
apps/mobile/app/auth/callback.tsx
docs/mobile-ui-system.md
```

## Verification

For a normal Phase 1 implementation, run:

```powershell
corepack pnpm verify
```

For this document-only audit capture, no app verification is required beyond
reviewing the markdown diff.

## Implementation Status

Initial migration pass implemented on 2026-08-27:

- Phase 1 foundation: dark semantic tokens, shared UI primitive retuning,
  bottom navigation restyle, and visible legacy palette cleanup.
- Phase 2 Library/Search: a real Continue Watching card for Library and
  poster-led Search discovery previews backed by existing discovery data.
- Phase 3 detail: movie/show detail now uses existing backdrop images for the
  hero treatment, and Where to Watch renders compact grouped provider rows.
- Phase 4 identity polish: public vs personal rating colors are distinct,
  existing check-ins render as elevated cards, and Watch Paths/Profile received
  dark-system polish.

Remaining future refinements should stay incremental: fuller Library/Home rails,
deeper Search browsing, more complete episode-season visual treatment,
full-bleed detail hero tuning, and provider prices only if the backend exposes
price data.
