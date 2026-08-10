# Stack

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

### TanStack Query

TanStack Query owns server state on the mobile client: fetching, caching, mutation lifecycle, retries, refetching, invalidation, background refresh, and stale data management.

Server resources must not be duplicated into Zustand.

### Zustand

Zustand owns only genuine global application/client state, such as theme, onboarding state, UI preferences, and ephemeral auth bootstrap state.

It must not become a client-side representation of the backend database.

### Zod

Zod provides TypeScript-first runtime schema validation for transport contracts and structural validation.

It should validate request and response shapes, not business rules.

### Expo SecureStore

SecureStore stores sensitive local values such as refresh credentials and other authentication material.

Large payloads should not be stored there; keep tokens small and handle native storage errors.

### AsyncStorage

AsyncStorage stores non-sensitive persistent preferences such as theme, onboarding completion, display preferences, and local UI settings.

It is unencrypted and must not store credentials, refresh tokens, access tokens, provider secrets, or private viewing data.

## Backend Stack

### NestJS

NestJS provides a structured TypeScript backend framework with modules, controllers, providers, dependency injection, testing support, and clear boundaries for a modular monolith.

### TypeScript

Use strict TypeScript on the backend. Domain services, use cases, repositories, adapters, and contracts should be typed.

### PostgreSQL

PostgreSQL is the primary database. It is relational, mature, transaction-safe, and well-suited for identity, catalog references, watch history, privacy settings, and future comparison queries.

### REST

REST is the initial API style. It is simple, cache-friendly, mobile-friendly, easy to debug, and sufficient for MVP resources.

Do not add GraphQL until there is a concrete API composition problem.

### TMDB Integration

TMDB is the initial media catalog provider. It must be accessed only by the backend through an adapter boundary.

### Google Identity / OpenID Connect

Google proves external identity. TVLore owns application identity.

Do not use Gmail API.

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

## References Consulted

- Expo navigation and Expo Router: https://docs.expo.dev/develop/app-navigation/
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://zustand.docs.pmnd.rs/
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

