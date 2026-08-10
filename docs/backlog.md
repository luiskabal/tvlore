# Backlog

This backlog tracks implementation tasks. The roadmap stays higher level; this file is the working queue.

## Active

No active infrastructure tasks.

## Next

- [ ] Add Google login.
- [ ] Issue access and refresh tokens.
- [ ] Replace demo `/users/me` with authenticated user lookup.
- [ ] Add TMDB-backed catalog search.
- [ ] Add show/movie detail endpoints.
- [ ] Add episode/movie watch tracking.
- [ ] Add progress and personal library endpoints.

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

## Deferred

- Social features.
- Ratings and recommendations.
- Offline mutation queues.
- Admin/web frontend.
- Payments/subscriptions.
