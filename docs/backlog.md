# Backlog

This backlog tracks implementation tasks. The roadmap stays higher level; this file is the working queue.

## Active

- [ ] Add Sign in with Apple for iOS store readiness.
- [ ] Add public Privacy Policy, Support, and account deletion URLs.
- [ ] Configure production EAS build/submit profiles, app identifiers, app icon, splash, and versioning.
- [ ] Continue removing release-blocking development affordances before store submission.

## Done Recently

- [x] Add in-app account deletion backed by API-owned user-data deletion and Supabase Auth deletion.
- [x] Start Search empty instead of using a seeded development query.
- [x] Hide `/health/error` when `NODE_ENV=production`.

## Next

- [x] Split `CatalogDetailContent.tsx` into focused detail subcomponents when the next detail UX feature touches it.
- [x] Move pure catalog response mappers out of `CatalogRepository` when catalog persistence is next edited.
- [ ] Add fetched Watch Path creation from public list sources after choosing a source format/provider.
- [ ] Add a TVLore-native recommendation engine with house rules, explicit taste signals, availability, and explainable reasons.
- [ ] Add a `TVLore Picks` / house-curated discovery section that is separate from personalized recommendations.
- [ ] Add an `Available in your country` discovery section for streamable titles, separate from recommendation ranking.
- [ ] Add aggregate favorite-character voting percentages to post-watch check-in, sorted by community popularity.

## Notes

- Show-level and season-level bulk watched actions are backend-owned so mobile does not issue one request per episode for those user intents.
- Mobile cleanup should start with the largest screens: `SeasonDetailScreen`, `CatalogDetailScreen`, `SearchScreen`, then `HomeScreen`.
- Keep the current screen -> hook -> API client boundary. The cleanup goal is readability, not a new state-management layer yet.
- Ratings are explicit preference signals. Keep them separate from watched state so recommendations can use both later.
- Post-watch check-in should never block `Watched`: save the watched state first, then open an optional skip-friendly flow.
- Post-watch check-in now persists a rating plus a separate reflection for shows, movies, and episodes: reaction, favorite character, and optional comment.
- Keep watched state, rating preferences, and per-watch reflections as separate concepts so rewatches, comments, and recommendations do not fight the same row later.
- Reaction tags, favorite-character picks, and comments are private product data for now. Spoiler/privacy rules are still required before any social surface.
- Favorite-character percentages need structured character votes first: provider person ID, actor name, character name, profile path, aggregate counts, and privacy-safe voter visibility rules.
- First recommendations intentionally use hydrated catalog data, ratings, genres, and a small provider-availability boost. Improve quality only after storing stronger content signals.
- Keep recommendation surfaces separate: personalized `For you`, contextual `Popular in your country`, utility `Available in your country`, and editorial `TVLore Picks`.
- TVLore-native recommendations should stay explainable before adding opaque ML or collaborative filtering.
- Personalized recommendations belong in Search for now. Library should stay focused on user-owned watched, saved, rated, and in-progress content; Profile should stay focused on identity, stats, and account controls.
- Cronologia uses a backend-owned paginated endpoint and loads more history as the user scrolls near the end.
- Watch Paths should support movies and shows in one ordered list, keep source/provenance, and resolve items into TVLore catalog IDs only when the user opens or saves the list.
- User-owned Watch Paths are persisted by the backend. Mobile imports the minimal provider refs and notes; the backend hydrates title, poster, and year from TMDB before storing the list.
- Where to Watch should stay backend-owned: provider API keys stay server-side, results are normalized by country, and mobile only renders availability badges/icons plus allowed attribution or links.
- Start by evaluating TMDB Watch Providers because TVLore already resolves TMDB refs. It gives country-specific subscription/rent/buy/free provider data, but JustWatch attribution is required and TMDB does not return full deep links.
- Evaluate Watchmode, JustWatch Partner API, or Streaming Availability API only if TVLore needs richer coverage, direct/deep links, episode-level availability, or better commercial terms.
- v1.0 scope and release gates live in `docs/release-v1-roadmap.md`.
- Keep new product features behind store-readiness blockers until v1.0 can enter TestFlight and Google Play internal testing.

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
- [x] Add first mobile post-watch rating check-in after marking movies or whole shows watched.
- [x] Surface rated shows and movies in Library/Profile.
- [x] Start first recommendation slice from stored ratings.
- [x] Persist catalog genre names and use them to rank recommendation candidates.
- [x] Boost recommendation candidates available to stream in the user's saved country.
- [x] Explain recommendation rows from preferred genre overlap.
- [x] Keep recommendation rows focused on opening detail instead of direct watchlist mutation.
- [x] Keep recommendations out of Profile and user-owned Library sections.
- [x] Move personalized recommendations from Library into Search.
- [x] Move the full recommendations list behind a dedicated Search entry route.
- [x] Add shared mobile lookahead prefetch for Search, recommendations, Library, and Watch Paths.
- [x] Add backend-owned show-level mark all watched/unwatched.
- [x] Add backend-owned paginated Cronologia feed.
- [x] Add infinite-scroll loading to mobile Cronologia.
- [x] Add short-lived mobile read cache for search and catalog detail reads.
- [x] Add an initial mobile UI component pool for repeated Library visual patterns.
- [x] Apply the mobile UI component pool to Search results and controls.
- [x] Apply the mobile UI component pool to catalog detail screens.
- [x] Apply the mobile UI component pool to season detail screens.
- [x] Add initial mobile Vitest coverage for pure search and chronology logic.
- [x] Add first country-aware Where to Watch slice on show/movie detail through TMDB Watch Providers.
- [x] Add first backend-owned curated Watch Paths slice with Marvel and Star Wars paths.
- [x] Let curated Watch Paths save every item to the user's watchlist in one backend-owned action.
- [x] Show saved watchlist state inside curated Watch Path detail.
- [x] Add user-owned imported Watch Paths after approving persistence/schema shape.
- [x] Add TMDB URL-assisted Watch Path import for pasted external list text.
- [x] Store the user's preferred availability country and render it with flag labels in mobile.
- [x] Add episode-level rating preferences and mobile episode rating UI.
- [x] Add backend-owned season-level mark all watched/unwatched and simplify the mobile season hook.
- [x] Harden the mobile API client for non-JSON, empty, or proxy-shaped error responses.
- [x] Normalize incoming `x-correlation-id` values before returning/logging them.
- [x] Split `LibraryOverview.tsx` by visible Library section.
- [x] Design watch reflection persistence separately from watched state and rating preferences.
- [x] Expand post-watch check-in to show/movie/episode reflections with sensation, favorite character, and optional comment.
- [x] Add TMDB-backed cast endpoints and visual favorite-character picker for post-watch check-ins.
- [x] Move post-watch check-in from modal to a dedicated mobile screen.
- [x] Add a country-aware `Popular in your country` discovery section using the user's saved availability country.

## Deferred

- TVLore-owned access and refresh token service.
- Social features.
- Richer recommendation ranking from stronger taste and behavior signals.
- Offline mutation queues.
- Admin/web frontend.
- Payments/subscriptions.
