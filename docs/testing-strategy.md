# Testing Strategy

Tests should focus on TVLore behavior, not framework internals.

## Confidence Map

Use different test layers for different risks:

| Risk | Best check | Why |
| --- | --- | --- |
| Type drift, broken imports, invalid DTO usage | `corepack pnpm verify` | Fast deterministic check for TypeScript and unit tests. |
| Backend domain rule regression | Feature-local Vitest tests in `apps/api/src/**/__tests__` | Rules such as progress, tracking, ratings, recommendations, and parsing should fail before deploy. |
| Mobile pure-state regression | Vitest tests for helpers/hooks that do not need a device | Search filters, chronology merges, and view-model helpers are cheap to test locally. |
| Deployed API contract regression | `corepack pnpm api:check` | Exercises the real HTTP API against local or Vercel. |
| Authenticated product regression | `TVLORE_SUPABASE_ACCESS_TOKEN` plus `corepack pnpm api:check` | Verifies real protected flows with a live Supabase session. |
| Env/config/release drift | `env:check`, `eas:env:check`, `store:check`, `auth:redirect:check` | Catches missing remote config before a mobile build or store submission. |
| Android artifact/distribution risk | `release:android:smoke`, EAS production AAB, Play internal testing | Confirms the app can be built, uploaded, and distributed by Google Play. |
| Real UX risk | Manual device QA from `docs/release-smoke-checklist.md` | Navigation, OAuth callback, perceived speed, and store install behavior need a real device. |

Current automated baseline as of August 21, 2026:

| Layer | Current signal |
| --- | --- |
| API Vitest | 33 test files, 120 tests passing. |
| Mobile Vitest | 13 test files, 57 tests passing. |
| TypeScript | API, mobile, and contracts typecheck through `corepack pnpm verify`. |
| HTTP smoke | Public routes, protected 401s, rate-limit headers, legal pages, and authenticated product flows are covered by `api:check`. |
| Release smoke | Android-specific smoke chains EAS env, release preflight, public store URLs, Supabase native redirect, full verify/build, and API smoke. |

This does not mean "no bugs exist." It means the current safety net is good at
catching contract, rule, and release-configuration regressions. Device UX,
Google Play propagation, screenshots, store forms, and reviewer behavior remain
manual release gates.

## Current Tooling

Normal deterministic verification:

```bash
corepack pnpm verify
```

This runs workspace type checking plus backend and mobile unit tests. It is the
default inner-loop command for agents and local development.

Full local verification:

```bash
corepack pnpm verify:full
```

This runs `verify` plus build checks. Use it before larger merges, releases, or
changes that affect build output.

Backend unit tests use Vitest:

```bash
corepack pnpm --filter @tvlore/api test:run
```

Mobile unit tests also use Vitest for pure TypeScript logic:

```bash
corepack pnpm --filter @tvlore/mobile test:run
```

From the monorepo root:

```bash
corepack pnpm test:run
```

API test files live in `__tests__` folders next to the feature they validate:

```text
apps/api/src/
|-- auth/
|   `-- __tests__/
|-- catalog/
|   `-- __tests__/
|-- tracking/
|   `-- __tests__/
|-- users/
|   `-- __tests__/
`-- __tests__/
```

Use feature-local `__tests__` folders for module rules and parsing tests. Use
`src/__tests__` only for root-level shared helpers such as `progress.ts`.

API contract checks use the real running API over HTTP:

```bash
corepack pnpm api:check
```

This is a smoke/functional check, not the default CI check, because it targets a
running API and authenticated product checks require a current Supabase access
token.

By default this targets production:

```text
https://tvlore-api.vercel.app
```

To target local:

```powershell
$env:TVLORE_API_BASE_URL="http://localhost:3000"
corepack pnpm api:check
```

Without `TVLORE_SUPABASE_ACCESS_TOKEN`, `api:check` verifies:

- Public health responses.
- Public privacy, terms, support, and account-deletion pages.
- Protected routes return the TVLore `UNAUTHORIZED` error contract.
- Protected-route rate-limit headers on representative endpoints.
- New routes are registered and protected.

With a current Supabase access token, `api:check` also verifies the real authenticated product flow:

```powershell
$env:TVLORE_API_BASE_URL="http://localhost:3000"
$env:TVLORE_SUPABASE_ACCESS_TOKEN="<paste access_token from Postman OAuth callback>"
corepack pnpm api:check
```

Authenticated `api:check` covers:

- `/users/me` contract.
- `/users/me/account-deletion` readiness contract.
- `/users/me` availability-country update and validation contract.
- Search response shape.
- Watch Paths list/detail contracts.
- Watch Path TMDB Collection import validation.
- Validation errors for bad search/resolve/watch inputs.
- Not-found errors for missing show/movie/episode IDs.
- Show resolve idempotency.
- Movie resolve idempotency.
- Search result `tvloreId` after resolve.
- Show, season, episode detail contracts.
- Show, movie, and episode cast contracts.
- Show, movie, and episode watch-provider availability contracts.
- Episode watch/unwatch idempotency.
- Movie watch/unwatch idempotency.
- Show-level and season-level watched/unwatched contracts.
- Show, movie, and episode preference contracts.
- Show, movie, and episode reflection contracts.
- Progress after marking an episode watched.
- Library summary, recently watched, watchlist, and rated titles after marking watched items and setting ratings.
- Paginated library chronology contract.
- Recommendations contract after rating titles.
- Recommendations availability-country contract.
- Discovery contracts for TVLore Picks, Popular in country, and Available to stream.

The first tests cover pure authentication/user helpers:

- Bearer-token parsing.
- Authenticated display-name derivation.

Keep this style for the MVP: small tests around rules and parsing, broader
integration tests only when persistence or endpoint contracts become risky.

## Backend Tests

### Domain and Business Rules

Test:

- Watched/unwatched semantics.
- Rewatch count behavior.
- Show progress calculation.
- Season progress calculation.
- Continue-watching derivation.
- Privacy decisions when future match is implemented.

### Use-Case Tests

Test:

- Google authentication resolves existing identity.
- Google authentication creates new user.
- Refresh token rotation.
- Logout revocation.
- Catalog resolve.
- Mark episode watched.
- Mark movie watched.
- Library summary and rated-title projection.
- Recommendations exclude already rated, watched, and watchlisted titles.
- Recommendations return an explainable TVLore score from genre matches, rating strength, media affinity, and streamable availability.

### Repository Integration Tests

Test with PostgreSQL where practical:

- Unique external identifier constraints.
- User identity uniqueness.
- Watch record queries.
- Progress query behavior.
- Transactional upserts.

### API Integration Tests

Test:

- Authenticated routes reject missing tokens. Covered by `corepack pnpm api:check`.
- Contracts match documented shapes. Covered by authenticated `corepack pnpm api:check` when `TVLORE_SUPABASE_ACCESS_TOKEN` is set.
- Validation errors return TVLore error contract. Covered by authenticated `corepack pnpm api:check`.
- Domain errors map to stable codes. Covered by authenticated `corepack pnpm api:check`.
- Recommendations return stable `basis` and `items` shapes. Covered by authenticated `corepack pnpm api:check`.

### Authentication Tests

Test:

- Invalid Google token rejection.
- Wrong audience rejection.
- Expired credential rejection.
- Refresh token reuse/revocation behavior.

### TMDB Adapter Tests

Use mocked provider responses.

Test:

- Search mapping.
- Show mapping.
- Movie mapping.
- Season/episode mapping.
- Provider error mapping.
- Invalid provider response handling.

## Mobile Tests

Use focused tests where they provide confidence:

- Pure screen-model helpers for filters, keys, cache-safe merges, and derived view data.
- Component tests for key states.
- Navigation tests for auth/protected route transitions.
- Query-hook/service tests.
- Zod contract tests.
- Authentication bootstrap tests.
- Mutation invalidation tests.

Do not test React Native, Expo Router, or future query-library internals.

The first mobile tests cover pure search and chronology helpers:

- Search filter to API media-type mapping.
- Minimum trimmed query length.
- Stable catalog result keys.
- Paginated chronology merges that preserve order and skip duplicates.
- Recommendation row detail copy for preferred-genre matches and fallbacks.

## Future Match Tests

When TVLore Match enters scope, add:

- Comparison algorithm unit tests.
- Privacy/authorization tests.
- Share-token expiration tests.
- Share-token revocation tests.
- Deterministic compatibility tests.
- Derived-result visibility tests.

## E2E Tests

Minimal E2E tests can be added later for:

- Login.
- Search.
- Open detail.
- Mark watched.
- See library/progress update.

Do not build a large E2E suite before product flow stabilizes.
