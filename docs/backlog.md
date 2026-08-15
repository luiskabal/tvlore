# Backlog

This backlog tracks implementation tasks. The roadmap stays higher level; this file is the working queue.

## Active

No active infrastructure tasks.

## Next

- [ ] Persist richer catalog signals, such as genres, before improving recommendation quality.
- [ ] Add curated watch paths for imported or fetched viewing orders, such as Marvel release or chronology order.
- [ ] Research and add a country-aware `Where to Watch` section for show/movie availability.

## Notes

- Season bulk watched is needed because marking episodes one by one is too slow for real use.
- Season-level bulk watched exists in season detail, and show-level bulk now has a backend use case so mobile does not fire hundreds of episode mutations.
- Mobile cleanup should start with the largest screens: `SeasonDetailScreen`, `CatalogDetailScreen`, `SearchScreen`, then `HomeScreen`.
- Keep the current screen -> hook -> API client boundary. The cleanup goal is readability, not a new state-management layer yet.
- Ratings are explicit preference signals. Keep them separate from watched state so recommendations can use both later.
- First recommendations intentionally use only hydrated catalog data and ratings. Improve quality only after storing stronger content signals.
- Recommendations belong in Library while it acts as the app home. Profile should stay focused on identity, stats, and account controls.
- Cronologia uses a backend-owned paginated endpoint and loads more history as the user scrolls near the end.
- Curated watch paths should support movies and shows in one ordered list, keep source/provenance, and resolve items into TVLore catalog IDs only when the user opens or saves the list.
- Where to Watch should stay backend-owned: provider API keys stay server-side, results are normalized by country, and mobile only renders availability badges/icons plus allowed attribution or links.
- Start by evaluating TMDB Watch Providers because TVLore already resolves TMDB refs. It gives country-specific subscription/rent/buy/free provider data, but JustWatch attribution is required and TMDB does not return full deep links.
- Evaluate Watchmode, JustWatch Partner API, or Streaming Availability API only if TVLore needs richer coverage, direct/deep links, episode-level availability, or better commercial terms.

## Done

- [x] Phase 0 documentation and ADRs.
- [x] Monorepo workspace structure.
- [x] API skeleton.
- [x] Mobile skeleton.
- [x] Health endpoint.
- [x] API error contract baseline.
- [x] Correlation ID baseline.
- [x] Configuration validation baseline.
- [x] Shared contracts package baseline.
- [x] Postman local collection and environment.
- [x] Mobile API health check.
- [x] Demo `GET /users/me` endpoint.
- [x] Mobile demo user display.
- [x] Extract the demo `GET /users/me` response into a backend `UsersService`.
- [x] Add local PostgreSQL setup.
- [x] Add Prisma ORM baseline.
- [x] Add the initial TVLore user model and migration.
- [x] Add database health check endpoint.
- [x] Add Supabase mobile client baseline.
- [x] Centralize API environment validation at startup.
- [x] Verify Supabase runtime connectivity from Vercel with `GET /health/db`.
- [x] Apply and verify the initial Prisma migration against Supabase.
- [x] Back `GET /users/me` with the Supabase `users` table for the demo user.
- [x] Add and verify auth identity/session database tables.
- [x] Configure Google OAuth provider through Supabase Auth.
- [x] Validate Google login on an Expo development build.
- [x] Validate Supabase access tokens in the backend.
- [x] Replace demo `/users/me` with authenticated user lookup.
- [x] Refactor backend auth/users into controller, service, repository, and provider boundaries.
- [x] Refactor mobile home/auth flow into screen, hooks, API client, auth client, and config boundaries.
- [x] Add initial backend unit test setup with Vitest.
- [x] Add TMDB-backed catalog search endpoint.
- [x] Add catalog resolve endpoint and initial catalog tables.
- [x] Add show/movie detail endpoints by TVLore ID.
- [x] Add season and episode catalog persistence.
- [x] Add episode/movie watch tracking.
- [x] Add progress and personal library endpoints.
- [x] Harden API smoke checks with contract assertions.
- [x] Render authenticated library summary on the mobile home screen.
- [x] Add mobile search, resolve, and show/movie detail flow.
- [x] Add debounced mobile search prefetch with reactive filters.
- [x] Add mobile search loading indicators and skeleton rows.
- [x] Make mobile search filters trigger immediate loading feedback.
- [x] Add mobile movie watch/unwatch control.
- [x] Add mobile season episode list for show details.
- [x] Add mobile watch/unwatch controls for episodes.
- [x] Add a season-level `Mark all watched` / `Mark all unwatched` action.
- [x] Refresh the mobile library automatically after returning from tracking screens.
- [x] Split mobile home library UI and styles out of `HomeScreen`.
- [x] Add mobile holo profile summary card.
- [x] Add navigation from mobile library rows to detail screens.
- [x] Add profile/home skeletons and stable refresh behavior.
- [x] Split mobile season detail presentation and styles out of `SeasonDetailScreen`.
- [x] Split mobile catalog detail presentation and styles out of `CatalogDetailScreen`.
- [x] Split mobile search controls, results, and styles out of `SearchScreen`.
- [x] Promote the temporary mobile home into routed Library, Search, and Profile surfaces.
- [x] Add detail-screen skeletons for show, movie, and season routes.
- [x] Decide to keep mobile server-state hooks local until watchlist proves more cache complexity.
- [x] Add a watchlist / want-to-watch state before social features.
- [x] Refine Library organization now that watched history and saved intent both exist.
- [x] Add richer removal/actions from Library rows after the segmented UX settles.
- [x] Add compact poster thumbnails to mobile Library rows.
- [x] Add personal show/movie rating preferences.
- [x] Surface rated shows and movies in Library/Profile.
- [x] Start first recommendation slice from stored ratings.
- [x] Let recommendation rows save directly to watchlist.
- [x] Keep recommendations out of Profile and scoped to Library.
- [x] Add backend-owned show-level mark all watched/unwatched.
- [x] Add backend-owned paginated Cronologia feed.
- [x] Add infinite-scroll loading to mobile Cronologia.
- [x] Add short-lived mobile read cache for search and catalog detail reads.
- [x] Add an initial mobile UI component pool for repeated Library visual patterns.
- [x] Apply the mobile UI component pool to Search results and controls.
- [x] Apply the mobile UI component pool to catalog detail screens.
- [x] Apply the mobile UI component pool to season detail screens.
- [x] Add initial mobile Vitest coverage for pure search and chronology logic.

## Deferred

- TVLore-owned access and refresh token service.
- Social features.
- Richer recommendation ranking.
- Offline mutation queues.
- Admin/web frontend.
- Payments/subscriptions.
