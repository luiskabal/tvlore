# Stack

This document explains the current TVLore technology choices and why each one
exists. It is intentionally practical: if a tool is not needed for Android 1.0,
it should not appear in the runtime path.

## Current Stack Snapshot

| Layer | Current choice | Role in TVLore |
| --- | --- | --- |
| Mobile app | React Native, Expo SDK 54, Expo Router, TypeScript | Native mobile UI, navigation, auth callback handling, local interaction state. |
| Mobile build | EAS Build | Produces Android APKs for preview QA and AABs for Google Play. |
| Android distribution | Google Play Console | Internal testing, closed testing, and future production release. |
| Backend | NestJS modular monolith, TypeScript | Domain rules, auth verification, persistence, provider orchestration, public legal pages. |
| API hosting | Vercel Functions | Production API deployment at `https://tvlore-api.vercel.app`. |
| Database | Supabase Postgres | TVLore users, identities, catalog rows, tracking, ratings, reflections, and paths. |
| ORM | Prisma | Typed database access and migrations. |
| Auth/session | Supabase Auth | Google OAuth, future Apple provider, access tokens, refresh sessions. |
| Media provider | TMDB | Catalog search/detail, images, cast, ratings, discovery, and watch-provider data. |
| Shared contracts | TypeScript and Zod | Shared transport DTOs and runtime response/request validation. |
| Tests | Vitest, TypeScript checks, smoke scripts | Fast validation for API, mobile pure logic, envs, and deployed routes. |
| Source control | GitHub | Version history, rollback trail, Vercel deploy source, EAS build source. |

## Runtime Shape

```text
Expo mobile app
-> Supabase Auth for login/session
-> TVLore API on Vercel
-> Supabase Postgres for product data
-> TMDB for provider catalog data
```

The mobile app never receives database credentials, Supabase service-role keys,
or the TMDB access token.

## Mobile Stack

### React Native

React Native provides native mobile UI while allowing TypeScript and React component development.

Use it because TVLore is mobile-first and needs native navigation, secure storage, app lifecycle handling, and device integration.

### Expo

Expo provides the mobile development platform, build tooling, app runtime APIs, and smoother React Native operations.

Use it to reduce native-project overhead during the MVP while preserving a path to native modules if needed later.

### Expo Router

Expo Router provides file-based routing for Expo and React Native applications. It maps the `app/` directory to routes and supports mobile navigation concepts such as tabs, stacks, dynamic routes, and deep links.

Use it as TVLore's navigation layer.

### TypeScript

TypeScript is required across mobile, backend, and contracts. Use strict mode.

### Mobile Server-State Hooks

The current mobile MVP keeps server state behind route-level hooks and the
TVLore API client. The API client owns a small in-memory read cache for
search/detail reads and request de-duplication.

Use this because the current invalidation surface is still small and explicit.
Revisit TanStack Query only if fetching, stale data, background refresh, and
mutation lifecycles become too broad for the local hook/API-client boundary.

Server resources must not be duplicated into a global client store.

### Global Client State

The current mobile app does not need a global state library. Local React state,
route hooks, SecureStore, AsyncStorage, and the API client cover the MVP.

If a real cross-screen UI concern appears, Zustand remains an acceptable small
store for client-only state such as theme, onboarding state, UI preferences, or
ephemeral auth bootstrap state. It must not become a client-side representation
of the backend database.

### Zod

Zod provides TypeScript-first runtime schema validation for transport contracts and structural validation.

It should validate request and response shapes, not business rules.

### Expo SecureStore

SecureStore stores sensitive local values such as refresh credentials and other authentication material.

Large payloads should not be stored there; keep tokens small and handle native storage errors.

### AsyncStorage

AsyncStorage stores non-sensitive persistent preferences such as theme, onboarding completion, display preferences, and local UI settings.

It is unencrypted and must not store credentials, refresh tokens, access tokens, provider secrets, or private viewing data.

### EAS Build

EAS Build produces the mobile artifacts used for release-like testing.

For Android:

```text
Preview QA -> APK
Google Play -> AAB
```

Use APKs for direct install checks. Use AABs for Google Play tracks because
Google Play generates optimized device-specific APKs from the bundle.

## Backend Stack

### NestJS

NestJS provides a structured TypeScript backend framework with modules, controllers, providers, dependency injection, testing support, and clear boundaries for a modular monolith.

### TypeScript

Use strict TypeScript on the backend. Domain services, use cases, repositories, adapters, and contracts should be typed.

### PostgreSQL

PostgreSQL is the primary database. It is relational, mature, transaction-safe, and well-suited for identity, catalog references, watch history, privacy settings, and future comparison queries.

### Supabase Postgres

Supabase hosts the Postgres database. TVLore uses it as infrastructure, not as
the owner of product rules. The backend still owns identity mapping, library
state, progress, tracking semantics, and authorization.

### Prisma

Prisma provides migrations and typed database access.

Use it for persistence boundaries inside repositories. Do not leak Prisma models
directly into mobile contracts.

### REST

REST is the initial API style. It is simple, cache-friendly, mobile-friendly, easy to debug, and sufficient for MVP resources.

Do not add GraphQL until there is a concrete API composition problem.

### Vercel

Vercel hosts the NestJS API as the production backend runtime.

Use it because the current API is a single deployable modular monolith with
simple HTTP traffic, environment-variable support, and GitHub-backed deploys.

Keep production env vars in Vercel only. Do not commit real secrets.

### TMDB Integration

TMDB is the initial media catalog provider. It must be accessed only by the backend through an adapter boundary.

### Google Identity / OpenID Connect

Google proves external identity. TVLore owns application identity.

Do not use Gmail API.

### Supabase Auth

Supabase Auth owns OAuth/session issuance. TVLore accepts Supabase access tokens
on protected backend routes and resolves them into internal TVLore users.

Google is the active provider. Apple Sign-In is wired in mobile but still needs
Apple Developer and Supabase provider setup for release-like iOS testing.

### Google Play Console

Google Play Console owns Android distribution.

Current lane:

```text
EAS production AAB -> Play internal testing -> Android device QA -> closed
testing if required -> production access -> public release
```

For a new personal Play developer account, closed testing with 12 opted-in
testers for 14 days may be required before public production access.

## Development And Verification Tooling

| Tool | Use |
| --- | --- |
| `pnpm` workspaces | Monorepo install/scripts. |
| TypeScript | Compile-time contract and implementation checks. |
| Vitest | API unit tests and mobile pure-logic tests. |
| Postman | Manual API exploration with Supabase OAuth tokens. |
| `api:check` | Local/Vercel HTTP smoke checks. |
| `env:check` | Local and Vercel env-name validation. |
| `eas:env:check` | EAS remote env-name validation. |
| `release:android:smoke` | Android release-lane smoke before Play builds. |
| `release:preflight` | Release guard for env leaks, dev-only diagnostics, public URLs, and obvious secrets. |

## Explicitly Excluded from MVP

- Microservices.
- Redis.
- Kafka.
- Queues.
- Event streaming.
- Kubernetes.
- Service mesh.
- GraphQL.
- CQRS frameworks.
- Event sourcing.
- Global server-state store in mobile.
- Offline mutation queue.
- Public social infrastructure.

Why they are excluded:

The current problem is a private entertainment tracker, not a distributed
social platform. These tools add operational and cognitive cost before TVLore
has the release pressure that would justify them.

## References Consulted

- Expo navigation and Expo Router: https://docs.expo.dev/develop/app-navigation/
- TanStack Query candidate reference: https://tanstack.com/query/latest
- Zustand candidate reference: https://zustand.docs.pmnd.rs/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo AsyncStorage page: https://docs.expo.dev/versions/latest/sdk/async-storage/
- Zod: https://zod.dev/
- NestJS database techniques: https://docs.nestjs.com/techniques/database
- NestJS Prisma recipe: https://docs.nestjs.com/recipes/prisma
- Prisma docs: https://www.prisma.io/docs
- Drizzle docs: https://orm.drizzle.team/
- TypeORM docs: https://typeorm.io/
- TMDB authentication docs: https://developer.themoviedb.org/docs/authentication-application
- Google OpenID Connect docs: https://developers.google.com/identity/openid-connect/openid-connect
