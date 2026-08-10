# 007 - Database ORM

## Status

Accepted

## Context

TVLore uses PostgreSQL and NestJS. The data model includes users, identities, refresh sessions, catalog entities, external identifiers, and watch records. The ORM/query layer should support relational modeling, migrations, transactions, TypeScript ergonomics, tests, and maintainability.

No ORM should be installed during the documentation phase.

## Decision

Use PostgreSQL with Prisma ORM's current stable GA line for the initial implementation.

Do not adopt early-access ORM rewrites for the MVP unless they have become the stable default by implementation time and a short spike confirms they fit NestJS, migrations, and deployment.

## Alternatives Considered

### Prisma

Strengths:

- Strong TypeScript developer experience.
- Mature schema and migration workflow.
- Good fit for fast MVP development.
- Official NestJS recipe exists.
- Clear generated client API.
- Good support for PostgreSQL relationships and transactions.

Tradeoffs:

- Generated-client abstraction can be less SQL-direct than Drizzle.
- Advanced SQL may require raw queries.
- The ecosystem may have multiple active generations; implementation should choose the stable GA path, not early access by default.

### Drizzle

Strengths:

- Lightweight and SQL-oriented.
- TypeScript schema definitions.
- Good PostgreSQL fit.
- Drizzle Kit supports migration generation.
- Less abstraction between code and SQL.

Tradeoffs:

- Fewer NestJS-specific conventions than Prisma/TypeORM.
- Requires more local architecture decisions around repositories and transaction patterns.
- May be slightly slower for a small team to standardize on during the first MVP.

### TypeORM

Strengths:

- Long-standing NestJS integration.
- Decorator/entity model familiar to many NestJS developers.
- Migration support.
- Works with PostgreSQL.

Tradeoffs:

- Type-safety and query ergonomics are generally weaker than Prisma/Drizzle.
- Decorator-heavy entities can blur persistence and domain boundaries.
- Historical footguns around lazy/eager loading and runtime behavior are not worth taking on for this project.

## Consequences

- Initial schema lives in Prisma schema/migrations once implementation begins.
- Repository code should keep Prisma details from leaking into controllers and mobile contracts.
- Domain rules must not be implemented inside generated model types.
- Advanced analytics or matching queries may use raw SQL later if Prisma becomes awkward.
- Revisit only if implementation discovers a concrete blocker.

## References

- https://www.prisma.io/docs
- https://docs.nestjs.com/recipes/prisma
- https://orm.drizzle.team/
- https://typeorm.io/
- https://docs.nestjs.com/techniques/database

