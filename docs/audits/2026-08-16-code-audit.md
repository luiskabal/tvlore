# TVLore Code Audit - 2026-08-16

Status: done

Scope:

- Security/privacy leaks.
- Runtime bugs and data-integrity risks.
- Architecture and framework boundaries.
- Tests and release safety.
- Over-engineering / simplification opportunities.

Rule for this audit: continue by cuts and stop only for a severe blocker, such as exposed secrets, broken auth, data-loss risk, or a production-breaking regression.

## Corte 0 - Inventory, Secrets, And Risk Map

Status: done

### Findings

1. NON_BLOCKING: Rate limiting is documented but not implemented yet. Protected endpoints require auth, but authenticated users can still hammer expensive provider-backed endpoints such as search, resolve, watch-provider availability, and recommendations. This is a cost/latency/provider-quota risk, not a current blocker for the MVP.

2. NON_BLOCKING: `x-correlation-id` is accepted, returned, and logged as provided by the client. Limit length and accepted characters before production to keep logs clean and avoid abusive correlation IDs. Reference: `apps/api/src/correlation-id.middleware.ts`.

3. NON_BLOCKING: The mobile API client assumes every API error response is JSON. If Vercel, Supabase, a proxy, or a provider edge case returns HTML/empty/non-JSON, the app may show a poorer generic error. Reference: `apps/mobile/src/api/client.ts`.

4. NON_BLOCKING: Several files are now large enough to slow review and feature work:
   - `tools/check-api.mjs`
   - `apps/mobile/src/home/LibraryOverview.tsx`
   - `apps/mobile/src/catalog/CatalogDetailContent.tsx`
   - `apps/mobile/src/api/guards.ts`
   - `apps/api/src/catalog/catalog.repository.ts`

### Positive Signals

- Worktree was clean before starting the audit.
- `.gitignore` protects local env files, Vercel local state, generated Prisma client, and dependencies.
- No real secrets were found hardcoded in source/docs/Postman. The Supabase publishable key is intentionally public.
- Postman auth variables are empty or secret-marked.
- Mobile auth uses SecureStore on native.
- Backend error filter avoids leaking internal stack traces to clients.

## Corte 1 - Backend

Status: done

### Findings

1. NON_BLOCKING: No application-level rate limiting exists yet for expensive authenticated routes. `GET /search`, `POST /catalog/resolve`, watch-provider routes, recommendations, and full-show watched hydration can generate external TMDB traffic. This can become a latency and quota issue as soon as the app has real usage. References: `apps/api/src/catalog/catalog.service.ts`, `apps/api/src/recommendations/recommendations.service.ts`, `docs/security.md`.

2. NON_BLOCKING: `CorrelationIdMiddleware` trusts any non-empty `x-correlation-id`, reflects it in the response header, and writes it into JSON logs. This should be normalized to a safe max length and charset. Reference: `apps/api/src/correlation-id.middleware.ts`.

3. NON_BLOCKING: `GET /library` returns full user library state in one response: all episode watches, movie watches, watchlist rows, and ratings. It is fine for the MVP, but can get slow and payload-heavy with real viewing history. Chronology is already paginated, so this should eventually move toward paginated/section-specific reads. Reference: `apps/api/src/library/library.repository.ts`.

4. NON_BLOCKING: `RecommendationsService` checks streaming availability by calling TMDB Watch Providers once per recommended item. The logic is useful, but lacks caching/TTL and may make recommendations feel slower. Reference: `apps/api/src/recommendations/recommendations.service.ts`.

5. NON_BLOCKING: `HealthController.getHealthError` exposes a deliberate `/health/error` route. Useful for validating the global error shape, but keep it disabled or protected before production. Reference: `apps/api/src/health.controller.ts`.

6. NON_BLOCKING: `CatalogRepository` is large because it owns persistence plus DTO mapping for shows, movies, seasons, episodes, and provider identifiers. The logic is coherent, but future feature work would be easier if response mappers are split into pure files. Reference: `apps/api/src/catalog/catalog.repository.ts`.

7. NON_BLOCKING: `RefreshSession` remains in the Prisma schema although Supabase currently owns sessions. This is a documented deferred path, not dead-dangerous code, but it should either become active later or be removed before it confuses auth ownership. Reference: `apps/api/prisma/schema.prisma`.

### Positive Signals

- Backend follows the intended `Controller -> Service -> Repository/Provider` shape.
- Controllers are thin and mostly transport-only.
- Input parsing is defensive and unit-tested for search, resolve, season/detail IDs, watch providers, watch timestamps, and ratings.
- User identity is resolved server-side from the Supabase bearer token; clients do not submit user IDs for scoped mutations.
- Watches, watchlist items, and ratings are idempotent through unique constraints plus `upsert`/`deleteMany`.
- Prisma schema has uniqueness and user/item indexes for the current mutation model.
- TMDB errors are mapped to stable API errors without leaking provider payloads.
- Show/movie/episode detail reads include user-scoped watchlist/watch/rating state by authenticated user ID.
- The previous episode watch response issue is covered by response guards on the mobile side and idempotent API responses on the backend.

### Ponytail Notes

- shrink: `CatalogRepository` can lose visual weight by moving pure DTO mappers into `catalog-mappers.ts`; behavior stays identical.
- shrink: `tools/check-api.mjs` is becoming a mini smoke-test framework; split by API flow only when editing it becomes painful.
- yagni: `RefreshSession` is inactive while Supabase owns sessions; keep only if near-term auth roadmap still needs custom refresh-token ownership.

### Severity Verdict

No severe blocker found in the backend cut.

## Corte 2 - Mobile

Status: done

### Findings

1. NON_BLOCKING/MEDIUM: Season-level "Mark all watched/unwatched" runs one request per episode, sequentially. If the request chain fails halfway, the backend may have partially changed data while the UI stays on the old season snapshot until refresh. This should become a backend season-level bulk endpoint or a safer client flow with explicit partial-success handling. Reference: `apps/mobile/src/catalog/use-season-detail.ts`.

2. NON_BLOCKING: `fetchJson` assumes every response body is JSON. This is the same risk found in Corte 0 from the mobile side: API-shaped errors are fine, but HTML/empty/proxy errors can throw before the response guard runs. Reference: `apps/mobile/src/api/client.ts`.

3. NON_BLOCKING: `SearchScreen` still starts with `"dark"` as the default query. Useful during development, but it makes Search feel seeded rather than user-led. Before release, default should likely be empty plus recommendations/picks. Reference: `apps/mobile/src/search/SearchScreen.tsx`.

4. NON_BLOCKING: Recommended picks entry renders a count and navigation even when the recommendation response may contain zero items. The destination handles empty state, but the entry should probably hide or change copy when count is zero. Reference: `apps/mobile/src/search/SearchRecommendations.tsx`.

5. NON_BLOCKING: Supabase `AppState.addEventListener` is registered at module load without an unsubscribe path. Runtime impact is low in a normal app session, but hot reload/tests can duplicate listeners. Reference: `apps/mobile/src/auth/supabase-auth.ts`.

6. NON_BLOCKING: Mobile runtime contracts are hand-maintained in `types.ts` plus `guards.ts`, while `packages/contracts` currently only exports `ApiError`. This works for MVP and avoids more tooling, but it can drift as endpoints grow. References: `apps/mobile/src/api/types.ts`, `apps/mobile/src/api/guards.ts`, `packages/contracts/src/index.ts`.

7. NON_BLOCKING: `LibraryOverview.tsx` is still doing too many presentation jobs in one file: section filtering, chronology fallback, optimistic removal, swipe confirm behavior, grouping watched episodes, empty-state copy, and row components. It is cleaner than before because hooks own data/actions, but it should be split once the next UI feature touches it. Reference: `apps/mobile/src/home/LibraryOverview.tsx`.

### Positive Signals

- Mobile follows the intended `Screen -> hook -> API/auth client` shape.
- Supabase auth is isolated in one module.
- Native auth storage uses SecureStore, while AsyncStorage is web-only.
- API reads are centralized through `client.ts`; raw `fetch` is not scattered across screens.
- The read cache is short-lived, in-memory only, keyed by request plus auth hash, dedupes in-flight reads, and clears on auth transitions and mutations.
- Search has debounce, immediate filter search, stale-response protection via request IDs, and loading/refreshing states.
- Detail screens use optimistic UI where rollback is clear: movie watched, watchlist, title rating, episode watched, episode rating.
- Library/Profile refresh via a single library revision notifier after mutations, solving the stale-back-navigation issue.
- `src/ui` now provides reusable atomic-ish primitives: text, button, badge, skeleton, stat card, poster/still frames, and media rows.
- Watch-provider availability is requested only from detail screens, matching the current UX decision.

### Ponytail Notes

- shrink: Split `LibraryOverview.tsx` into section components only when touching those sections again; do not refactor just to satisfy file-size aesthetics.
- shrink: `guards.ts` is verbose but dependency-free. Keep it until contract drift becomes painful, then either expand `packages/contracts` with schemas or generate guards from shared schemas.
- yagni: Avoid adding TanStack Query until invalidation/cache needs exceed the current small in-memory cache.

### Severity Verdict

No severe blocker found in the mobile cut. The strongest fix candidate is the season bulk mutation flow.

## Corte 3 - Tests, CI, And Release Safety

Status: done

### Evidence

- `corepack pnpm verify`: passed locally.
- `corepack pnpm verify:full`: passed locally.
- `corepack pnpm api:check`: passed against `https://tvlore-api.vercel.app` for public and unauthenticated-protected checks. Authenticated product checks were skipped because `TVLORE_SUPABASE_ACCESS_TOKEN` was not set in the audit shell.
- Latest GitHub Actions run inspected: `feat(episodes): add rating preferences`, triggered by push on 2026-08-16, status `Success`, duration 42s. URL: `https://github.com/luiskabal/tvlore/actions/runs/31955479814`.

### Findings

1. NON_BLOCKING: CI runs the fast `verify` gate, while `verify:full` is only local/manual. That is a good inner-loop tradeoff, but before bigger releases we should keep using `verify:full` because it includes build output validation. Reference: `.github/workflows/verify.yml`.

2. NON_BLOCKING: `api:check` authenticated product coverage depends on a fresh Supabase access token from the developer environment. This is intentional because we should not store user session tokens in CI, but it means real authenticated end-to-end behavior remains a manual smoke test. Reference: `tools/check-api.mjs`.

3. NON_BLOCKING: The latest GitHub Actions run is green, but GitHub reports a Node.js 20 deprecation warning from upstream action runtimes. This is not breaking the app; it is repository maintenance noise to revisit when action versions/runtime support move forward.

4. NON_BLOCKING: `gh` CLI is not installed locally. If CI fails again, the fastest local terminal workflow is limited unless we use the GitHub web UI or the GitHub connector. This is not a code issue, just a developer-experience gap.

5. NON_BLOCKING: Mobile tests cover hooks/helpers and API interaction logic, but there is no rendered React Native navigation/component coverage. Current iPhone manual testing is doing that job. Add focused render tests only for workflows that repeatedly regress.

6. NON_BLOCKING: No lint gate is configured at the root. TypeScript catches contract and type drift, but style, import hygiene, and accidental complexity are not automatically flagged. Add lint only if review noise starts costing time.

7. NON_BLOCKING: No coverage threshold is enforced. That is acceptable for the MVP because the tests are targeted at behavior, but endpoint and mobile workflow coverage should grow with each major feature.

### Positive Signals

- Root `verify` exercises all three project boundaries: contracts, API, and mobile.
- API tests are broad for the current backend surface: health, auth, search, resolve, library, recommendations, watch paths, watches, watchlist, ratings, and provider details.
- Mobile tests cover the new interaction model: search debounce/prefetch behavior, library refresh model, optimistic watch/rating paths, and UI primitive behavior.
- Vercel API smoke checks validate public uptime, DB health, auth rejection, request validation, catalog resolve, progress, watches, ratings, and library flows when a token is supplied.
- The GitHub failure email concern appears historical: the latest inspected run is passing.

### Ponytail Notes

- shrink: Keep CI simple while the repo is small. Do not add broad test infrastructure until a real regression pattern appears.
- shrink: Split `tools/check-api.mjs` only when editing it becomes slow or error-prone; it is currently valuable as one executable smoke story.
- yagni: Do not add synthetic seeded-user CI auth yet. It introduces secret/session ownership before the product needs it.

### Severity Verdict

No severe blocker found in the tests/CI/release cut. The release posture is healthy for an MVP, with authenticated smoke tests still manual by design.

## Corte 4 - Complexity, SOLID, And Duplication

Status: done

### Findings

1. NON_BLOCKING/MEDIUM: The biggest real product file is `LibraryOverview.tsx` at 945 lines. It is cleaner than the previous all-in-one screen because data/actions live in hooks, but the component still owns multiple independent UI sections and interaction rules. Split by library section the next time we touch Library UX: summary filters, chronology, continue watching, grouped episodes, watchlist, rated titles, and swipe rows. Reference: `apps/mobile/src/home/LibraryOverview.tsx`.

2. NON_BLOCKING/MEDIUM: `CatalogDetailContent.tsx` is 650 lines and combines title header, action icons, public/user rating display, watch providers, rating controls, seasons, and progress presentation. The hook owns behavior, so this is presentation complexity, not domain leakage. Split into detail subcomponents when continuing title/episode UX. Reference: `apps/mobile/src/catalog/CatalogDetailContent.tsx`.

3. NON_BLOCKING/MEDIUM: Season bulk actions are the clearest SOLID/API boundary issue. The client is orchestrating "mark whole season watched" by looping over episode mutations. That is a domain operation and should move to the backend as one season-level mutation. References: `apps/mobile/src/catalog/use-season-detail.ts`, `apps/api/src/tracking/tracking.service.ts`, `apps/api/src/tracking/tracking.repository.ts`.

4. NON_BLOCKING: `CatalogRepository` is 574 lines because it mixes persistence reads/writes with response mapping. It still obeys repository ownership, but pure mappers can be extracted without changing behavior. Reference: `apps/api/src/catalog/catalog.repository.ts`.

5. NON_BLOCKING: `tools/check-api.mjs` is 1164 lines and acts as a full smoke-test story. It is useful, but future edits will be safer if flows are split into small helpers/files: auth rejection checks, search/resolve checks, tracking checks, preferences checks, library checks, recommendations/watch-path checks.

6. NON_BLOCKING: Mobile `guards.ts` plus `types.ts` are manually maintained and large. This is acceptable dependency-light runtime validation, but it duplicates API contracts in practice. Long-term options: move response schemas into `packages/contracts` or generate mobile guards from shared schemas. References: `apps/mobile/src/api/guards.ts`, `apps/mobile/src/api/types.ts`, `packages/contracts/src/index.ts`.

7. NON_BLOCKING: Small helper duplication exists across mobile catalog hooks/screens:
   - `getOptimisticWatchCount` in catalog detail, season detail, and episode detail hooks.
   - `formatDate` in catalog detail, season content, and episode detail screens.
   - backend parser helpers such as `isRecord`, `throwValidation`, `getString`, and `getPositiveInteger` across small input parser files.
   These are not blockers. Extract only the mobile optimistic/date helpers now if we touch those files; leave backend parser duplication local until it causes drift.

8. NON_BLOCKING: `AppModule` manually registers every controller/provider. That is fine for the current modular monolith, but once feature modules grow further we should move to Nest feature modules by domain. Do not do this as a standalone rewrite yet. Reference: `apps/api/src/app.module.ts`.

9. NON_BLOCKING: Mobile tests are split: API/backend tests live mostly under `__tests__`, while mobile tests are colocated near models/helpers. Both are valid styles. If test files feel noisy while browsing feature code, prefer a consistent mobile `__tests__` or `*.test.ts` convention per feature folder, not a separate global test dump that loses context.

### Positive Signals

- No scattered `TODO`, `FIXME`, `HACK`, `debugger`, or app-debug `console.log` calls were found in product code.
- Raw network calls are well-contained: backend calls Supabase Auth and TMDB from dedicated services/clients; mobile raw `fetch` lives in `api/client.ts`.
- Backend already follows `Controller -> Service -> Repository/Provider`.
- Mobile largely follows `Screen -> hook -> API/auth client`.
- Styles are mostly separated into `*-styles.ts` files, with local styles only in small atomic UI primitives.
- `src/ui` exists and is a good base for the atomic-design direction: AppText, Button, Badge, MediaRow, PosterImage, StillImage, Skeleton, StatCard, and tokens.
- Current caching/prefetch is deliberately small and understandable: in-memory read cache, mutation invalidation, and lookahead detail/season prefetch.

### SOLID Reading

- Single Responsibility is mostly respected at the architectural layer, but not always at component-file size. The main SRP opportunities are UI subcomponent extraction and one backend season bulk domain endpoint.
- Open/Closed is acceptable: adding new API features usually means adding a controller/service/repository method rather than modifying unrelated modules.
- Liskov/Interface Segregation are not major concerns yet because there are few polymorphic abstractions. Avoid adding interfaces just for ceremony.
- Dependency Inversion is simple and good enough for Nest: services depend on repositories/providers through constructor injection. Avoid extra abstraction until tests or provider swaps need it.

### Ponytail Notes

- shrink: Do not split every duplicate helper automatically. Extract only helpers that cross three files and are actively being edited.
- shrink: Avoid global state managers. Current cache + revision store handles the real problems without adding more dependencies.
- yagni: Do not create a full design-system package yet. Keep growing `apps/mobile/src/ui` with actual reused primitives.

### Severity Verdict

No severe blocker found in the complexity/SOLID cut. The highest-leverage next fix is a backend season bulk mutation plus a small mobile hook simplification around it.

## Consolidated Priority

Status: done

### P0 - Stop Conditions

No P0 or severe blocker was found.

The audit did not find exposed secrets, broken auth ownership, uncontrolled data-loss paths, production-breaking deployment state, or a reason to stop feature work.

### P1 - Fix Next

1. Add backend-owned season-level bulk watched/unwatched.
   Why: this removes the only meaningful domain operation currently orchestrated by mobile one episode at a time. It also reduces API latency, partial-failure risk, and UI complexity.

2. Harden `fetchJson` for non-JSON and empty responses.
   Why: this is a small reliability fix that improves app behavior when Vercel/proxies/providers return unexpected response bodies.

3. Normalize incoming `x-correlation-id`.
   Why: this protects observability/log quality without changing product behavior.

### P2 - Refactor When Touching Related Features

1. Split `LibraryOverview.tsx` by section.
   Why: Library is now a real product surface with chronology, grouped episodes, watchlist, rated titles, continue watching, and actions.

2. Split `CatalogDetailContent.tsx` into detail header, action cluster, rating panel, availability panel, progress/seasons panel.
   Why: title detail UX will keep growing with episode detail, post-watch check-in, ratings, and where-to-watch.

3. Move pure catalog DTO mapping out of `CatalogRepository`.
   Why: repository behavior is correct, but response mapping weight makes review slower.

4. Extract shared mobile helpers only when files are touched: optimistic watch count and date formatting.
   Why: these helpers are duplicated in three places, but they are too small to justify a standalone refactor unless we are already editing those flows.

### P3 - Later / Scale Triggers

1. Add app-level rate limiting for expensive authenticated endpoints.
   Trigger: real users, open beta, provider quota pressure, or abuse signals.

2. Expand `packages/contracts` beyond `ApiError`.
   Trigger: mobile guards drift from backend responses or endpoint count doubles again.

3. Split `tools/check-api.mjs` into smoke-flow modules.
   Trigger: the next time smoke checks become hard to edit safely.

4. Add rendered React Native workflow tests.
   Trigger: repeated visual/navigation regressions that manual iPhone testing keeps catching late.

5. Consider Nest feature modules.
   Trigger: AppModule registration or provider ownership becomes harder to review than the current flat modular monolith.

### Final Verdict

Proceed with feature work. The safest next engineering increment is to fix the season bulk boundary first, because it improves backend ownership, mobile simplicity, latency, and data consistency in one coherent cut.
