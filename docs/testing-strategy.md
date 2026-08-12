# Testing Strategy

Tests should focus on TVLore behavior, not framework internals.

## Current Tooling

Backend unit tests use Vitest:

```bash
corepack pnpm --filter @tvlore/api test:run
```

From the monorepo root:

```bash
corepack pnpm test:run
```

API contract checks use the real running API over HTTP:

```bash
corepack pnpm api:check
```

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
- Protected routes return the TVLore `UNAUTHORIZED` error contract.
- New routes are registered and protected.

With a current Supabase access token, `api:check` also verifies the real authenticated product flow:

```powershell
$env:TVLORE_API_BASE_URL="http://localhost:3000"
$env:TVLORE_SUPABASE_ACCESS_TOKEN="<paste access_token from Postman OAuth callback>"
corepack pnpm api:check
```

Authenticated `api:check` covers:

- `/users/me` contract.
- Search response shape.
- Validation errors for bad search/resolve/watch inputs.
- Not-found errors for missing show/movie/episode IDs.
- Show resolve idempotency.
- Movie resolve idempotency.
- Search result `tvloreId` after resolve.
- Show, season, episode detail contracts.
- Episode watch/unwatch idempotency.
- Movie watch/unwatch idempotency.
- Progress after marking an episode watched.
- Library summary and recently watched after marking episode/movie watched.

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
- Library summary.

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

- Component tests for key states.
- Navigation tests for auth/protected route transitions.
- Query-hook/service tests.
- Zod contract tests.
- Authentication bootstrap tests.
- Mutation invalidation tests.

Do not test React Native, Expo Router, or TanStack Query internals.

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
