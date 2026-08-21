# Code Tour

This guide maps product questions to the files you should open first. It is
meant for day-to-day work: debugging, adding a feature, reviewing a change, or
planning a safe refactor.

## 1. Monorepo Shape

```text
apps/
  api/       NestJS API, Prisma schema, Vercel runtime
  mobile/    Expo app, Expo Router routes, EAS config
packages/
  contracts/ shared transport schemas and DTO types
docs/        architecture, release, backlog, store, and operations docs
tools/       smoke checks, env checks, release helpers, Postman collection
```

The working boundaries are:

```text
Mobile screen -> hook -> API/auth client
API controller -> service -> repository/provider
```

The backend owns product state and rules. The mobile app owns presentation,
navigation, loading states, and local interaction state.

## 2. Backend Entry Points

Start with `apps/api/src/app.module.ts` when you need to see what is wired into
the Nest app. It registers controllers, services, repositories, providers,
rate limiting, Prisma, and Supabase auth.

| Concern | Open first | Then inspect |
| --- | --- | --- |
| App bootstrap | `apps/api/src/main.ts` | `apps/api/src/create-app.ts`, `apps/api/src/app.module.ts` |
| Env validation | `apps/api/src/config.ts` | `docs/configuration.md`, `.env.example` |
| Error contract | `apps/api/src/api-error.filter.ts` | `apps/api/src/http-types.ts`, `packages/contracts/src/index.ts` |
| Correlation IDs | `apps/api/src/correlation-id.middleware.ts` | `apps/api/src/__tests__/correlation-id.middleware.test.ts` |
| Rate limiting | `apps/api/src/rate-limit.guard.ts` | `apps/api/src/__tests__/rate-limit.guard.test.ts` |
| Database access | `apps/api/src/prisma.service.ts` | `apps/api/prisma/schema.prisma` |

## 3. Backend Feature Modules

Most backend modules follow this shape:

```text
feature.controller.ts   HTTP routes and request parsing
feature.service.ts      application/domain behavior
feature.repository.ts   persistence queries
feature.types.ts        local response and helper types
feature-input.ts        input parsing helpers when needed
__tests__/              feature-local tests
```

| Feature | Main files | Owns |
| --- | --- | --- |
| Auth | `auth/supabase-auth.service.ts`, `auth/bearer-token.ts`, `auth/supabase-user.ts` | Supabase token validation and authenticated user derivation. |
| Users | `users/users.controller.ts`, `users/users.service.ts`, `users/users.repository.ts` | TVLore user profile, country preference, account deletion readiness/deletion. |
| Catalog | `catalog/catalog.controller.ts`, `catalog/catalog.service.ts`, `catalog/catalog.repository.ts` | TMDB search/resolve, show/movie/season/episode details, cast, watch providers. |
| TMDB adapter | `catalog/tmdb-client.ts` plus `catalog/catalog-*.ts` helpers | External provider calls and mapping into TVLore shapes. |
| Tracking | `tracking/tracking.controller.ts`, `tracking/tracking.service.ts`, `tracking/tracking.repository.ts` | Watched/unwatched for episodes, movies, seasons, and full shows. |
| Watchlist | `watchlist/watchlist.controller.ts`, `watchlist/watchlist.service.ts`, `watchlist/watchlist.repository.ts` | Save/remove shows and movies for later. |
| Preferences | `preferences/preferences.controller.ts`, `preferences/preferences.service.ts`, `preferences/preferences.repository.ts` | 1-5 ratings for shows, movies, and episodes. |
| Reflections | `reflections/reflections.controller.ts`, `reflections/reflections.service.ts`, `reflections/reflections.repository.ts` | Post-watch emotion, favorite character, and optional comment. |
| Library | `library/library.controller.ts`, `library/library.service.ts`, `library/library.repository.ts` | Library summary, grouped watched data, continue watching, chronology. |
| Recommendations | `recommendations/recommendations.service.ts`, `recommendations/recommendation-scoring.ts` | Explainable TVLore score and personalized suggestion filtering. |
| Discovery | `discovery/discovery.controller.ts`, `discovery/discovery.service.ts`, `discovery/discovery-picks.ts` | TVLore Picks, popular in country, available to stream. |
| Watch Paths | `watch-paths/watch-paths.controller.ts`, `watch-paths/watch-paths.service.ts`, `watch-paths/watch-paths.repository.ts` | Curated paths, user paths, TMDB Collection import, save all to watchlist. |
| Legal/Health | `legal.controller.ts`, `health.controller.ts`, `root.controller.ts` | Store-required public pages, health checks, API root response. |

Rule of thumb: if a change affects permission, persistence, progress, ratings,
recommendation eligibility, or provider orchestration, start in the backend.

## 4. Mobile Routes

Expo Router maps files in `apps/mobile/app` to screens.

| Route file | Surface |
| --- | --- |
| `app/_layout.tsx` | Root stack and persistent tab bar mounting. |
| `app/index.tsx` | Redirect to the Library surface. |
| `app/library.tsx` | Library tab. |
| `app/search.tsx` | Search tab. |
| `app/paths.tsx` | Watch Paths tab. |
| `app/profile.tsx` | Profile tab. |
| `app/picks.tsx` | TVLore Picks list. |
| `app/recommendations.tsx` | Personalized recommendations list. |
| `app/popular.tsx` | Popular in country list. |
| `app/available.tsx` | Available to stream list. |
| `app/movies/[id].tsx` | Movie detail. |
| `app/shows/[id].tsx` | Show detail. |
| `app/shows/[id]/seasons/[seasonNumber].tsx` | Season detail. |
| `app/episodes/[id].tsx` | Episode detail. |
| `app/check-in.tsx` | Post-watch rating/reflection flow. |
| `app/auth/callback.tsx` | Supabase OAuth redirect handler. |

Route files should stay thin. They compose feature screens and pass route
params, but should not own API parsing or domain rules.

## 5. Mobile Feature Folders

| Folder | Owns |
| --- | --- |
| `src/api` | TVLore HTTP client, endpoint groups, response guards, transport types. |
| `src/auth` | Supabase session, OAuth, auth callback parsing. |
| `src/config` | Public mobile env validation. |
| `src/navigation` | App tab definitions, tab bar UI, route transition behavior. |
| `src/ui` | Reusable presentation primitives: text, buttons, surfaces, posters, skeletons, rating stars, stat cards. |
| `src/catalog` | Movie/show/season/episode details, watch providers, check-in, detail prefetch, tracking/watchlist/rating UI wiring. |
| `src/search` | Search input/filter model, discovery cards, progressive result feed, recommendation/popular/available screens. |
| `src/library` | Library actions, chronology paging, lookahead prefetch, refresh invalidator. |
| `src/home` | Shared Library/Profile model, library overview presentation, holo profile card, recommendation panel. |
| `src/profile` | Profile screen, country preference, legal links, logout, account deletion UI. |
| `src/watch-paths` | Watch path list/detail screens, imports, local path input model. |

Keep reusable visual atoms in `src/ui`. Keep feature-specific layout and copy in
the feature folder. Keep HTTP and response-shape validation in `src/api`.

## 6. Shared Contracts

`packages/contracts` is intentionally small. It currently exposes shared
transport-level schemas such as the TVLore API error contract.

Use contracts for DTO shape shared between app and API. Do not put business
policy, persistence queries, or UI-specific model helpers in this package.

## 7. Tests

Backend tests live near the feature they validate:

```text
apps/api/src/catalog/__tests__/
apps/api/src/tracking/__tests__/
apps/api/src/users/__tests__/
apps/api/src/__tests__/
```

Mobile tests focus on pure model/helpers:

```text
apps/mobile/src/search/*.test.ts
apps/mobile/src/library/*.test.ts
apps/mobile/src/catalog/*.test.ts
apps/mobile/src/api/*.test.ts
apps/mobile/src/navigation/*.test.ts
```

Use `apps/api/src/__tests__` only for root-level shared behavior. Prefer
feature-local `__tests__` folders for feature rules.

## 8. Common Change Paths

| Task | Backend first | Mobile first | Verification |
| --- | --- | --- | --- |
| Add a protected endpoint | Controller, service, repository, tests | API client, guard, hook/screen | `corepack pnpm verify`, then `corepack pnpm api:check` if HTTP contract changed. |
| Change library data | `library` repository/service tests | `src/home`, `src/library`, `src/api/library.ts` | `corepack pnpm verify` and authenticated `api:check`. |
| Change tracking behavior | `tracking` service/repository tests | Detail screen hook/action state | `corepack pnpm verify` and authenticated `api:check`. |
| Change search/discovery | `catalog`, `discovery`, `recommendations` tests | `src/search`, `src/catalog/prefetch.ts` | `corepack pnpm verify`; manual slow-network UX check. |
| Add a reusable UI primitive | None unless API data shape changes | `src/ui`, then replace one or two call sites | `corepack pnpm verify`. |
| Change auth/session flow | `auth`, `users`, Supabase config docs | `src/auth`, route guards | Ask first; then `verify`, auth redirect check, manual mobile login. |
| Change env vars | `apps/api/src/config.ts`, `.env.example` | `src/config/env.ts`, EAS env docs | `corepack pnpm env:check`, `corepack pnpm eas:env:check`. |
| Android release work | Release docs and config | EAS build config | `corepack pnpm release:android:preflight`, then Play Console upload. |

## 9. Avoid These Shortcuts

- Do not put backend domain rules in route screens.
- Do not make mobile local state the source of truth for watched/progress data.
- Do not add a global store just to avoid prop drilling in one screen.
- Do not call TMDB directly from mobile.
- Do not persist provider IDs as if they were TVLore identity.
- Do not store tokens or private viewing data in AsyncStorage.
- Do not add a dependency before checking whether the current hook/client
  boundary is enough.

## 10. Fast Verification

Use this after normal code changes:

```powershell
corepack pnpm verify
```

Use this for release-sensitive changes:

```powershell
corepack pnpm verify:full
```

Use this for API smoke checks:

```powershell
corepack pnpm api:check
```

Authenticated `api:check` requires `TVLORE_SUPABASE_ACCESS_TOKEN`.
