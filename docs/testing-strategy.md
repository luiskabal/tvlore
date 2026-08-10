# Testing Strategy

Tests should focus on TVLore behavior, not framework internals.

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

- Authenticated routes reject missing tokens.
- Contracts match documented shapes.
- Validation errors return TVLore error contract.
- Domain errors map to stable codes.

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

