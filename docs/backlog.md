# Backlog

This backlog tracks implementation tasks. The roadmap stays higher level; this file is the working queue.

## Active

No active infrastructure tasks.

## Next

- [ ] Clean up mobile screen files by splitting route/container logic, presentational rows/panels, and styles.
- [ ] Promote the temporary mobile home into routed Library/Profile surfaces.

## Notes

- Season bulk watched is needed because marking episodes one by one is too slow for real use.
- Mobile cleanup should start with the largest screens: `SeasonDetailScreen`, `CatalogDetailScreen`, `SearchScreen`, then `HomeScreen`.
- Keep the current screen -> hook -> API client boundary. The cleanup goal is readability, not a new state-management layer yet.

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

## Deferred

- TVLore-owned access and refresh token service.
- Social features.
- Ratings and recommendations.
- Offline mutation queues.
- Admin/web frontend.
- Payments/subscriptions.
