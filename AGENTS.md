# TVLore Agent Instructions

Use the repository implementation as the source of truth. Inspect the relevant files before changing code, then make the smallest coherent change that satisfies the task.

## Architecture Boundaries

- Backend: NestJS modular monolith. Keep the pattern `Controller -> Service -> Repository or Provider`.
- Mobile: Expo + React Native + Expo Router. Keep the pattern `Screen -> hook -> API/auth client`.
- The backend owns domain rules, identity, authorization, progress, and persistence.
- The mobile app owns presentation and local interaction state only.
- Do not add speculative modules, dependencies, state managers, or future-product abstractions.
- Respect `packages/contracts`, `apps/mobile/src/api/tvlore-api.ts`, and documented API/mobile boundaries.

## Normal Builder Loop

1. Read the task and relevant docs.
2. Inspect existing implementation before planning edits.
3. State a short plan when the work is non-trivial.
4. Implement a small increment.
5. Run the required verification.
6. Fix failures introduced by the change.
7. Update docs/backlog only when behavior, architecture, or workflow materially changes.

## Verification

Run this for normal code changes:

```powershell
corepack pnpm verify
```

Run this before larger merges/releases or when build output could be affected:

```powershell
corepack pnpm verify:full
```

Use `corepack pnpm api:check` as an HTTP smoke check against local or Vercel. Authenticated product checks require `TVLORE_SUPABASE_ACCESS_TOKEN`.

Use `corepack pnpm env:check` when environment variables, Vercel settings, or `.env.example` contracts change.

Do not claim completion if task-relevant verification is failing. If a failure is pre-existing or environment-dependent, call it out explicitly.

## Reviewer Loop

Reviewers should compare the task, acceptance criteria, diff, relevant implementation, architecture boundaries, and verification output.

Classify findings as:

- `BLOCKING`: acceptance criteria missed, functional regression, security/privacy issue, broken contract, incorrect persistence, architecture violation, or missing required verification.
- `NON_BLOCKING`: useful improvement that does not block completion.
- `APPROVED`: no blocking findings.

## Human Gates

Ask for approval before:

- major authentication changes
- changing Supabase as auth/database provider
- destructive database operations or migrations
- substantial schema redesigns
- security/privacy model changes
- OAuth behavior changes
- new paid services
- major dependencies
- major architecture rewrites
- API provider strategy changes
- production deployment behavior changes
- secrets-management changes
- data-loss risks
- public API breaking changes
- irreversible Git operations

Routine implementation work should proceed without unnecessary approval.
