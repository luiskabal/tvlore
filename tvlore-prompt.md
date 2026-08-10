You are acting as the principal software architect for a new mobile-first application called **TVLore**.

Your task is to create the complete initial technical and product architecture documentation BEFORE any application code is written.

Do NOT implement the application.

Do NOT initialize frameworks, install dependencies, create application source code, or generate database migrations.

Your output must consist only of technical/product documentation inside a `/docs` directory.

The purpose of this documentation is to establish a stable foundation so future Codex sessions and engineers can implement TVLore without rediscovering architectural decisions or accidentally introducing business logic into the mobile application.

---

# 1. Product identity

Product name:

**TVLore**

TVLore is a mobile-first entertainment tracking application centered around a user's personal viewing history.

The product starts as a tracker for:

* TV shows
* seasons
* episodes
* movies

but the long-term product idea is broader than simply tracking content.

TVLore should progressively build a user's **audiovisual taste profile** from what they watch, finish, rate, revisit, abandon, or add to their library.

The product should eventually use this accumulated data to help users connect with other people.

A possible brand idea is:

> Track what you watch. Discover what you share.

Do not treat this tagline as final branding.

---

# 2. Product philosophy

Tracking is the foundation of TVLore, but the long-term value comes from what can be derived from that tracking data.

The application should eventually answer questions such as:

* What have I watched?
* What episode am I on?
* What should I continue watching?
* What movies and shows do I like most?
* What genres dominate my viewing history?
* What have my friends watched?
* What do another person and I have in common?
* Where do our tastes differ?
* What have I watched that they have not?
* What have they watched that I have not?
* What could we watch together that neither of us has seen?

The architecture must therefore treat viewing history as meaningful first-party product data rather than a disposable UI preference.

---

# 3. Core future social concept

TVLore should eventually support a distinctive social feature based around comparing viewing profiles.

This feature is NOT part of the first implementation milestone, but the architecture must not make it unnecessarily difficult to add later.

Conceptually, every user may eventually have a shareable TVLore profile.

A user could generate a QR code or shareable deep link.

Another authenticated TVLore user could scan/open it.

The backend would compare both users' authorized viewing data and generate a comparison.

Conceptual flow:

```text
User A
  │
  │ Generate profile QR / Match Link
  ▼
TVLore Backend
  │
  │ Temporary/shareable identifier
  ▼
QR / Deep Link
  │
  ▼
User B
  │
  ▼
TVLore Backend
  │
  ├── identify both users
  ├── validate privacy permissions
  ├── compare viewing histories
  ├── compare ratings/preferences
  └── calculate derived results
  │
  ▼
Match Result
```

Possible comparison results:

```text
Luis × Diego

87% Taste Match

183 titles in common

Both watched
────────────
Breaking Bad
Severance
Dark

Luis watched / Diego hasn't
────────────────────────────
Andor
Chernobyl

Diego watched / Luis hasn't
────────────────────────────
Silo
Shōgun

Biggest agreement
─────────────────
Breaking Bad

Biggest disagreement
────────────────────
Lost

Watch together
──────────────
Titles neither has watched
```

This is a product direction, not a finalized scoring specification.

DO NOT design an unnecessarily complex matching algorithm yet.

---

# 4. Important QR/privacy rule

The QR code must NEVER contain viewing history, ratings, email addresses, user IDs, Google identifiers, authentication credentials, or other private data.

Conceptually it should contain only an opaque identifier, deep link, or temporary token.

For example:

```text
tvlore://match/{opaque-token}
```

or:

```text
https://tvlore.app/m/{opaque-token}
```

The backend remains responsible for:

* resolving the token
* authenticating the scanning user
* checking privacy settings
* determining what data may participate in comparison
* calculating the comparison
* returning only authorized derived information

This feature should be documented as post-MVP architecture.

---

# 5. Social philosophy

TVLore should NOT initially become a traditional social network.

The product does NOT initially need:

* follower counts
* public feeds
* influencer mechanics
* algorithmic timelines
* comments
* direct messages
* social posting
* engagement farming

The initial social philosophy should instead revolve around:

> discovering common ground through entertainment.

Future social interactions may include:

* compare profiles
* taste compatibility
* common titles
* differences
* recommendations based on one person's history
* titles neither person has watched
* shared watchlists
* optional friend relationships

These should remain future product capabilities unless explicitly promoted into a later milestone.

---

# 6. MVP definition

The first technical MVP must remain intentionally small.

The first meaningful end-to-end product milestone is:

1. Launch TVLore.
2. Authenticate with Google.
3. Retrieve the authenticated TVLore user.
4. Search TV shows and movies.
5. Open TV show details.
6. Browse seasons and episodes.
7. Open movie details.
8. Mark episodes as watched/unwatched.
9. Mark movies as watched/unwatched.
10. Display basic viewing progress.
11. Display a simple personal library/profile summary.

The MVP should prove the architecture and tracking model.

It does NOT need to prove the social matching feature yet.

---

# 7. Initial architecture

TVLore is mobile-first.

Use a monorepo.

Initial conceptual structure:

```text
/
├── apps/
│   ├── mobile/
│   └── api/
│
├── packages/
│   └── contracts/
│
└── docs/
```

Future applications such as web/admin may later become:

```text
apps/
├── mobile/
├── api/
├── web/       # future
└── admin/     # future
```

Do NOT create them now.

---

# 8. Mobile technology stack

Document the following intended mobile stack:

* React Native
* Expo
* Expo Router
* TypeScript
* TanStack Query
* Zustand
* Zod
* Expo SecureStore
* AsyncStorage where appropriate

Explain clearly why each exists.

React Native / Expo are responsible for native mobile UI and device integration.

Expo Router is responsible for navigation.

TanStack Query owns server state.

Zustand owns only genuine global client/application state.

React state owns local UI state.

SecureStore owns sensitive persistent credentials.

AsyncStorage owns non-sensitive persistent preferences.

---

# 9. Backend technology stack

Initial backend:

* NestJS
* TypeScript
* PostgreSQL
* REST
* TMDB integration
* Google Identity / OpenID Connect

Use a modular monolith.

Do NOT introduce:

* microservices
* Redis
* Kafka
* queues
* event streaming
* Kubernetes
* service mesh
* GraphQL
* CQRS frameworks
* event sourcing

unless future requirements demonstrably justify them.

---

# 10. Fundamental architecture rule

The backend is the source of truth.

The mobile client must NEVER become responsible for business behavior.

The mobile application may contain:

* UI logic
* presentation logic
* navigation logic
* structural input validation
* form validation
* local interactions
* loading/error presentation
* device-specific behavior
* temporary UI state

The backend must contain:

* business rules
* authorization
* resource ownership
* tracking rules
* progress calculation
* rewatch semantics
* state transitions
* data consistency
* provider orchestration
* persistence rules
* privacy rules
* future matching logic
* future compatibility calculations

Use this architectural test:

> If another future client would need the same rule, the rule belongs in the backend.

Future clients may include:

* web
* native iOS
* native Android
* Apple TV
* Android TV
* public API
* internal admin tools

Deleting the React Native application must NOT delete any business behavior.

---

# 11. Validation rules

Zod may be used for transport and structural validation.

Examples of acceptable client-side validation:

```text
required field
UUID format
date format
enum value
string length
payload structure
```

Examples of forbidden mobile business validation:

```text
whether an episode may be marked watched
whether a movie can be modified
whether an episode belongs to a show
whether a user owns a resource
whether something counts as a rewatch
whether a season is complete
how show completion percentage is calculated
whether two profiles may be compared
whether another user's history may be exposed
how compatibility is calculated
```

Those belong to the backend.

---

# 12. State management architecture

Document the four main categories.

## Local UI state

Use React state.

Examples:

```text
modal visibility
selected tab
search input
expanded season
temporary filters
```

## Server state

Use TanStack Query.

Examples:

```text
current user
search results
show details
movie details
seasons
episodes
watch history
progress
library
future match result
```

Do NOT duplicate server resources into Zustand.

TanStack Query should manage:

* caching
* stale data
* request lifecycle
* loading
* retries
* refetch
* invalidation
* mutations
* background refresh

## Global application state

Use Zustand sparingly.

Possible examples:

```text
theme
onboarding state
ephemeral authentication state
UI preferences
```

Zustand must NEVER become a client-side representation of the backend database.

Do not implement:

```text
shows[]
episodes[]
watchHistory[]
ratings[]
friends[]
```

as globally synchronized Zustand domain stores.

## Persistent device state

Expo SecureStore:

```text
refresh credentials
sensitive authentication material
```

AsyncStorage:

```text
theme
onboarding completion
display preferences
non-sensitive local settings
```

---

# 13. Data ownership

Separate provider data from TVLore-owned data.

## External catalog/provider data

Initially TMDB provides:

* TV shows
* movies
* titles
* descriptions
* posters
* backdrops
* genres
* season metadata
* episode metadata
* release/air dates
* cast information where needed
* provider metadata where useful

## TVLore-owned data

TVLore owns:

* users
* identities
* viewing history
* watched timestamps
* rewatches
* show progress
* movie history
* ratings
* favorites
* watchlists
* future friendship relationships
* future match sessions
* future taste-profile data
* privacy settings

Provider metadata should not determine application identity.

---

# 14. Internal identifiers

Do not expose TMDB IDs as TVLore's permanent domain identity.

TVLore entities should use internal IDs, preferably UUIDs.

External IDs should be mappings.

Conceptually:

```text
Show
├── id
├── title
└── externalIds
    ├── tmdb
    ├── imdb?
    └── tvdb?

Movie
├── id
├── title
└── externalIds
    ├── tmdb
    └── imdb?
```

Evaluate whether provider IDs belong directly on the entity or in an `ExternalIdentifier` table.

Document the tradeoff.

---

# 15. Authentication architecture

Authentication must support a mobile client.

Use:

* Google Identity
* OpenID Connect / OAuth where appropriate

Do NOT use Gmail API.

Conceptual flow:

```text
TVLore Mobile
      ↓
Google Sign-In
      ↓
Google credential
      ↓
TVLore API
      ↓
Verify credential with Google
      ↓
Resolve UserIdentity
      ↓
Find/Create TVLore User
      ↓
Issue TVLore credentials
      ↓
SecureStore
```

Google proves external identity.

TVLore owns the application identity.

Use separate conceptual entities:

```text
User

UserIdentity
├── id
├── userId
├── provider
└── providerSubject
```

Do not put architecture in place that assumes Google will always be the only identity provider.

Future providers may include Apple.

---

# 16. Token/session architecture

Because the primary client is mobile, document an access-token + refresh-token model.

Requirements:

* short-lived access token
* refresh mechanism
* secure storage
* token rotation considerations
* revocation strategy
* logout
* backend authorization
* no credentials logged
* no sensitive tokens stored in AsyncStorage

Evaluate JWT access tokens versus opaque tokens.

Do not automatically choose JWT simply because NestJS supports it.

Document the decision.

---

# 17. Backend domain structure

Propose a clean NestJS modular-monolith layout.

Conceptually:

```text
src/
├── auth/
├── users/
├── catalog/
│   ├── shows/
│   ├── movies/
│   ├── seasons/
│   └── episodes/
│
├── tracking/
├── library/
│
└── integrations/
    └── tmdb/
```

Future modules may include:

```text
ratings/
social/
matches/
recommendations/
notifications/
```

Do not create those implementations yet.

Explain separation between:

* controllers / transport
* application use cases
* domain logic
* repositories
* infrastructure
* provider integrations

Controllers must remain thin.

---

# 18. TMDB integration

TMDB is the initial catalog provider.

Do not let TMDB API responses leak directly throughout TVLore.

Create/document an anti-corruption/adapter boundary.

Conceptually:

```ts
interface MediaCatalogProvider {
  search(query: string): Promise<SearchResult[]>;
  getShow(providerId: string): Promise<ExternalShow>;
  getMovie(providerId: string): Promise<ExternalMovie>;
  getSeason(
    providerId: string,
    seasonNumber: number
  ): Promise<ExternalSeason>;
}
```

This interface is illustrative, not mandatory.

Document the final proposed abstraction.

External models must be mapped into TVLore models/contracts.

---

# 19. Catalog persistence strategy

Explicitly document how TVLore should handle catalog entities obtained from TMDB.

Evaluate strategies such as:

A. Always proxy TMDB without catalog persistence.

B. Persist a title only after a TVLore user interacts with it.

C. Maintain a local catalog mirror.

For the MVP, strongly prefer the simplest strategy that still supports durable watch-history references.

Explain how a user can safely reference a Show/Episode/Movie with an internal TVLore ID without needing to mirror the entire TMDB catalog.

---

# 20. Tracking domain

The tracking model is one of the most important architectural areas.

Document how TVLore should represent:

* watched episode
* unwatched episode
* watched movie
* watchedAt
* rewatches
* completion
* show progress
* season progress

Evaluate whether a simple `EpisodeWatch` record is preferable to a generic `WatchEvent`.

Do not overdesign future analytics.

However, make sure the model can eventually answer:

```text
What has this user watched?

How many times?

When?

What is their current progress?

What shows did they abandon?

Which titles do two users share?

Which titles has only one watched?
```

The last three requirements should influence modeling but should not create unnecessary complexity.

---

# 21. Future TVLore Match architecture

Create a dedicated documentation section for the future comparison feature.

Possible domain concepts:

```text
MatchShareToken
MatchSession
MatchResult
ProfilePrivacySettings
Friendship
```

Treat these as exploratory.

Document at least two possible models:

## Ephemeral comparison

Results are calculated when requested and are not permanently stored.

## Persisted comparison

A MatchSession stores enough information to revisit/share the comparison.

Recommend which should be preferred initially and why.

The architecture should favor derived results over unnecessary duplication.

For example, avoid permanently storing:

```text
183 common titles
87% compatibility
```

if these can be safely recomputed from current data.

---

# 22. Future compatibility algorithm

Do NOT design an AI recommendation engine.

Document only a simple conceptual evolution.

Version 1 might consider:

```text
shared watched titles
intersection size
differences
ratings similarity if ratings exist
favorite overlap
```

Future versions might consider:

```text
genres
rewatches
completion behavior
abandoned shows
recency
rating confidence
```

Compatibility must remain backend-owned.

The score should be explainable.

Avoid black-box AI until the product requires it.

---

# 23. Privacy architecture

Because TVLore viewing history becomes social data, document privacy from the beginning.

Potential privacy controls:

```text
Profile visibility

Allow comparisons

Share watched titles

Share ratings

Share favorites

Share watchlist

Share watch dates

Allow friend requests
```

Do NOT implement all of these in the first MVP.

Define safe defaults.

The system must never assume that because two users interact, all viewing data becomes mutually accessible.

Prefer returning derived comparison results instead of exposing another user's raw history.

---

# 24. Initial REST API

Design an MVP REST API.

At minimum evaluate endpoints around:

```text
GET    /health

POST   /auth/google
POST   /auth/refresh
POST   /auth/logout

GET    /users/me

GET    /search

GET    /shows/:id
GET    /shows/:id/seasons
GET    /shows/:id/seasons/:seasonNumber

GET    /movies/:id

POST   /episodes/:id/watches
DELETE /episodes/:id/watches

POST   /movies/:id/watches
DELETE /movies/:id/watches

GET    /shows/:id/progress

GET    /library
```

You may improve the resource naming and REST semantics.

For each endpoint document:

* purpose
* auth requirement
* route parameters
* query parameters
* request contract
* response contract
* expected status codes
* errors
* authorization requirements
* transport validation
* business validation

Do not finalize endpoints without explaining reasoning.

---

# 25. Future social API

Document possible future endpoints without implementing them.

Examples may include:

```text
POST /match-links

POST /matches/:token

GET /matches/:id

DELETE /match-links/:id
```

Do not treat these names as requirements.

Design a clean resource model and document it.

---

# 26. API error contract

Create a consistent TVLore API error contract.

For example:

```json
{
  "code": "EPISODE_NOT_FOUND",
  "message": "Episode not found",
  "details": null,
  "correlationId": "..."
}
```

Document:

* validation errors
* authentication errors
* authorization errors
* domain errors
* provider failures
* rate-limit errors
* unexpected failures

NestJS internal exception formats must not leak directly to clients.

The mobile application may translate error codes into UX copy.

It may NOT duplicate the backend logic that generated them.

---

# 27. Mobile architecture

Document an initial Expo Router structure.

Conceptual example:

```text
app/
├── _layout.tsx
│
├── (auth)/
│   └── login.tsx
│
├── (tabs)/
│   ├── index.tsx
│   ├── search.tsx
│   ├── library.tsx
│   └── profile.tsx
│
├── shows/
│   └── [id].tsx
│
└── movies/
    └── [id].tsx
```

Do not treat this structure as mandatory.

Document:

* routing
* tabs
* stack navigation
* protected navigation
* authentication bootstrap
* API client
* request interceptors where appropriate
* query hooks
* mutations
* loading states
* error states
* token refresh
* app lifecycle
* foreground refetch
* offline behavior expectations

Do NOT implement offline-first synchronization during MVP.

---

# 28. API/client boundary

Do not scatter raw HTTP requests across components.

Document a client architecture such as:

```text
UI Screen
    ↓
Query Hook
    ↓
TVLore API Client
    ↓
HTTP
    ↓
NestJS
```

Example:

```text
useShow(id)
useSearch(query)
useMarkEpisodeWatched()
useLibrary()
```

These hooks are client infrastructure.

They must NOT implement backend business decisions.

---

# 29. Shared contracts

Evaluate:

```text
packages/contracts
```

This package may contain:

* request schemas
* response schemas
* Zod transport schemas
* TypeScript DTO types
* enums
* API error contracts

It must NOT contain:

* backend domain services
* business policies
* repositories
* use cases
* progress calculations
* match calculations
* authorization rules

Document how to avoid tightly coupling mobile and backend internals while still benefiting from TypeScript.

---

# 30. PostgreSQL

Use PostgreSQL.

Create an ADR comparing:

* Prisma
* Drizzle
* TypeORM

Evaluate:

* NestJS integration
* TypeScript ergonomics
* migrations
* PostgreSQL support
* relational modeling
* transactions
* testing
* maintainability
* development speed

Recommend one.

Do NOT install it.

---

# 31. Initial conceptual entities

At minimum evaluate:

```text
User
UserIdentity
RefreshSession / RefreshToken

Show
Season
Episode
Movie

EpisodeWatch
MovieWatch

ExternalIdentifier
```

Potential future concepts:

```text
Rating
Favorite
Watchlist
Friendship
MatchShareToken
MatchSession
ProfilePrivacySettings
```

Do not introduce future tables simply because they may exist someday.

Create a Mermaid ER diagram for the MVP model.

Create a separate conceptual future ER extension showing how social/match entities might connect later.

---

# 32. Diagrams

Create Mermaid diagrams compatible with GitHub Markdown for:

1. TVLore system context.
2. Mobile/API/TMDB/PostgreSQL architecture.
3. Google authentication flow.
4. Token refresh flow.
5. Show search flow.
6. Show detail flow.
7. Mark episode watched flow.
8. Mark movie watched flow.
9. State ownership.
10. MVP database ER model.
11. Future QR Match flow.
12. Future social domain extension.
13. Trust/security boundaries.

Use sequence diagrams where useful.

---

# 33. Security

Document a practical MVP security baseline.

Include:

* HTTPS outside local development
* Google credential verification on backend
* secure refresh-token storage
* short-lived access tokens
* refresh token rotation considerations
* backend authorization
* request validation
* no TMDB credentials in mobile bundle
* no backend secrets in mobile bundle
* no secrets in logs
* no raw authentication credentials in analytics
* rate limiting for auth
* rate limiting for expensive provider endpoints
* rate limiting for future match links
* opaque QR/share tokens
* expiration/revocation of share tokens
* replay considerations
* database constraints
* OWASP-oriented baseline
* privacy-by-default thinking

Do not create enterprise security complexity without reason.

---

# 34. Configuration and environments

Initial environments:

```text
local
development
production
```

Do not introduce staging/QA unless a concrete need exists.

Document environment variables conceptually.

Examples:

```text
DATABASE_URL

TMDB_ACCESS_TOKEN

GOOGLE_CLIENT_ID

ACCESS_TOKEN_SIGNING_KEY

REFRESH_TOKEN_SIGNING_KEY
```

Do not commit secrets.

Prefer explicit configuration validation at backend startup.

---

# 35. Testing strategy

Backend:

* domain/business-rule unit tests
* use-case tests
* repository integration tests
* API integration tests
* authentication tests
* TMDB adapter tests using mocked provider responses

Mobile:

* component tests where meaningful
* navigation tests where valuable
* query-hook/service tests
* Zod contract tests
* authentication bootstrap tests
* minimal E2E tests later

Future match functionality:

* comparison algorithm unit tests
* privacy/authorization tests
* share-token expiration tests
* deterministic compatibility tests

Do not test framework internals.

---

# 36. Observability

Keep MVP observability simple.

Document:

* structured JSON logs
* correlation/request IDs
* authentication failure logs
* provider request failures
* backend errors
* request latency
* no sensitive content in logs

Do not introduce Datadog, OpenTelemetry infrastructure, ELK, Prometheus, etc. during initial implementation unless needed.

Design logs so future observability platforms can consume them.

---

# 37. Coding rules

Create explicit engineering rules.

At minimum:

* TypeScript strict mode.
* No `any` unless justified.
* Backend is source of truth.
* No business logic in React components.
* No business logic in Zustand.
* No business logic in query hooks.
* No business logic in controllers.
* Business rules must be testable without HTTP.
* External providers must be behind adapters.
* TMDB models must not leak into the domain.
* Mobile must not contain provider secrets.
* Never trust client-provided identity.
* Authorization happens server-side.
* Keep modules cohesive.
* Avoid circular dependencies.
* Prefer composition.
* Prefer readability.
* Avoid premature abstraction.
* Avoid premature optimization.
* Avoid enterprise patterns without concrete value.
* Use database constraints as an additional integrity boundary.
* Use consistent naming.
* Domain concepts should use TVLore terminology rather than TMDB terminology where possible.

---

# 38. Product terminology

Propose a small glossary.

Potential terms:

```text
Library
Watched
Watch History
Progress
Continue Watching
Profile
Lore
Taste Profile
Match
Common Titles
Watch Together
```

Do NOT overbrand technical/domain concepts.

For example, database tables do not need marketing names.

Evaluate whether "Lore" should be used in product copy such as:

```text
My Lore
Build your Lore
Compare your Lore
```

but treat this as a UX/branding exploration rather than an architectural requirement.

---

# 39. MVP out of scope

Explicitly document the following as OUT OF SCOPE for initial implementation:

* traditional social feed
* comments
* followers
* direct messages
* friend system
* QR matching implementation
* compatibility scoring implementation
* shared watchlists
* ratings
* advanced statistics
* recommendations
* AI
* push notifications
* widgets
* offline-first synchronization
* background synchronization beyond normal query refresh
* Trakt
* TVmaze
* TheTVDB
* streaming playback
* content hosting
* Redis
* Kafka
* queues
* microservices
* Kubernetes
* web frontend
* admin panel
* subscriptions
* payments

Some may appear in future roadmap sections.

---

# 40. Development roadmap

Create a phased roadmap.

## Phase 0 — Architecture

* documentation
* ADRs
* monorepo conventions
* coding rules
* domain model
* API design

## Phase 1 — Foundation

* mobile skeleton
* API skeleton
* PostgreSQL
* local environment
* health endpoint
* shared contracts baseline

## Phase 2 — Identity

* Google login
* TVLore user creation
* `/users/me`
* access token
* refresh flow
* logout

## Phase 3 — Catalog

* TMDB integration
* unified search
* TV show details
* movie details
* seasons
* episodes
* local catalog identity strategy

## Phase 4 — Tracking

* mark episode watched
* mark episode unwatched
* mark movie watched
* mark movie unwatched
* progress
* personal library
* continue watching

At this point the MVP is usable.

## Phase 5 — Taste Profile

Potential future work:

* ratings
* favorites
* richer statistics
* genre affinity
* completion patterns
* rewatches

## Phase 6 — TVLore Match

Potential future work:

* QR/deep-link profile sharing
* privacy controls
* ephemeral match tokens
* common titles
* differences
* simple compatibility
* watch-together candidates

## Phase 7 — Social Expansion

Only if product validation supports it:

* friends
* persisted matches
* shared lists
* recommendation exchange
* social discovery

---

# 41. Architecture Decision Records

Create at least:

```text
docs/adr/

001-mobile-stack.md
002-backend-modular-monolith.md
003-state-management.md
004-authentication.md
005-access-refresh-token-strategy.md
006-media-provider-tmdb.md
007-database-orm.md
008-catalog-persistence.md
009-shared-contracts.md
010-tracking-model.md
011-internal-vs-provider-identifiers.md
012-future-social-match-boundary.md
```

ADR format:

```text
Title
Status
Context
Decision
Alternatives Considered
Consequences
```

Use:

```text
Accepted
```

for decisions that are sufficiently established.

Use:

```text
Proposed
```

when investigation is still required.

---

# 42. Required documentation tree

Create at minimum:

```text
docs/
├── README.md
├── product-vision.md
├── architecture.md
├── stack.md
├── mvp-scope.md
├── roadmap.md
├── domain-model.md
├── api-design.md
├── mobile-architecture.md
├── backend-architecture.md
├── state-management.md
├── authentication.md
├── tracking-model.md
├── tmdb-integration.md
├── social-vision.md
├── tvlore-match.md
├── privacy.md
├── security.md
├── error-handling.md
├── testing-strategy.md
├── observability.md
├── configuration.md
├── coding-rules.md
├── glossary.md
│
└── adr/
    ├── 001-mobile-stack.md
    ├── 002-backend-modular-monolith.md
    ├── 003-state-management.md
    ├── 004-authentication.md
    ├── 005-access-refresh-token-strategy.md
    ├── 006-media-provider-tmdb.md
    ├── 007-database-orm.md
    ├── 008-catalog-persistence.md
    ├── 009-shared-contracts.md
    ├── 010-tracking-model.md
    ├── 011-internal-vs-provider-identifiers.md
    └── 012-future-social-match-boundary.md
```

You may add files if they provide clear value.

Do not remove important documentation merely to shorten the output.

---

# 43. README navigation

`docs/README.md` must act as the documentation index.

It should explain:

* what TVLore is
* MVP goal
* architecture at a glance
* reading order
* ADR index
* current architecture status
* unresolved decisions

Recommended reading order:

```text
product-vision
mvp-scope
architecture
stack
domain-model
tracking-model
api-design
mobile-architecture
backend-architecture
state-management
authentication
security
social-vision
tvlore-match
roadmap
ADRs
```

---

# 44. Questions the documentation must explicitly answer

By the end of the documentation, another engineer should be able to answer:

1. What is TVLore?
2. What makes it different from a generic tracker?
3. What is actually part of the MVP?
4. What is deliberately postponed?
5. Why React Native + Expo?
6. Why NestJS?
7. Why PostgreSQL?
8. Which layer owns business logic?
9. Which layer owns server state?
10. When do we use Zustand?
11. Where are credentials stored?
12. How does Google authentication work?
13. How does token refresh work?
14. How is TMDB isolated?
15. How do TVLore IDs differ from provider IDs?
16. When do catalog records enter PostgreSQL?
17. How is an episode watch represented?
18. How is a movie watch represented?
19. How is progress calculated?
20. How can the tracking model support future user comparisons?
21. What information could a future TVLore Match reveal?
22. How does QR sharing remain private?
23. Why is matching backend-owned?
24. What should the first implementation task be?

If the documentation does not clearly answer one of these questions, improve it before finishing.

---

# 45. Final architecture principles

These principles should appear prominently in the documentation:

> TVLore is mobile-first.

> The backend is the source of truth.

> The mobile application owns presentation, not domain behavior.

> Tracking data is first-party product data.

> External media providers provide catalog metadata, not product identity.

> TVLore owns its internal identifiers.

> TanStack Query owns server state.

> Zustand is not a client-side database.

> Sensitive credentials live in secure device storage.

> Social comparison should reveal derived insights rather than unnecessarily exposing raw user history.

> QR codes contain opaque references, never profile data.

> The MVP should remain simple.

> Future capabilities should influence boundaries, not inflate the MVP implementation.

---

# 46. Final output from this task

After creating all documentation:

1. Print the complete generated documentation tree.
2. Summarize TVLore's product vision.
3. Summarize the MVP.
4. Summarize the architecture.
5. List all Accepted ADRs.
6. List all Proposed ADRs.
7. List unresolved technical decisions.
8. List important assumptions.
9. List risks that should be revisited before production.
10. Recommend exactly ONE smallest implementation task to perform next.
11. Do NOT perform that implementation task.

Do not write application code.

Do not scaffold the project.

Do not install packages.

Do not create migrations.

Do not create `.env` files.

Documentation and architecture only.

The objective is not to design the perfect enterprise platform.

The objective is to create a clean, pragmatic foundation for **TVLore**, where a simple mobile entertainment tracker can eventually become a product that helps people discover how the stories they watch connect them.
