# Coding Rules

These rules should guide implementation after this documentation phase.

## General Rules

- Use TypeScript strict mode.
- Do not use `any` unless the reason is documented locally.
- Prefer readability over cleverness.
- Avoid premature abstraction.
- Avoid premature optimization.
- Avoid enterprise patterns without concrete value.
- Keep modules cohesive.
- Avoid circular dependencies.
- Prefer composition.
- Use consistent naming.
- Use TVLore terminology instead of TMDB terminology in domain code.

## Architecture Rules

- The backend is the source of truth.
- The mobile application owns presentation, not domain behavior.
- No business logic in React components.
- No business logic in Zustand.
- No business logic in query hooks.
- No business logic in controllers.
- Business rules must be testable without HTTP.
- Controllers must stay thin.
- External providers must be behind adapters.
- TMDB models must not leak into the domain.
- Mobile must not contain provider secrets.
- Never trust client-provided identity.
- Authorization happens server-side.
- Use database constraints as an additional integrity boundary.

## Validation Rules

Zod may validate transport shape and structural input:

- Required fields.
- UUID format.
- Date format.
- Enum values.
- String length.
- Payload structure.

Mobile must not validate business behavior such as:

- Whether an episode may be marked watched.
- Whether a movie can be modified.
- Whether an episode belongs to a show.
- Whether a user owns a resource.
- Whether something counts as a rewatch.
- Whether a season is complete.
- How show completion percentage is calculated.
- Whether two profiles may be compared.
- Whether another user's history may be exposed.
- How compatibility is calculated.

Those rules belong to the backend.

## Business Logic Test

Use this test when deciding where code belongs:

> If another future client would need the same rule, the rule belongs in the backend.

Future clients may include web, native iOS, native Android, Apple TV, Android TV, public API, and admin tools.

