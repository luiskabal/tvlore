# Development Roadmap

The MVP baseline is already implemented. The next major target is a store-ready
v1.0 release.

For the full v1.0 catalog and release plan, see
[Release v1.0 Roadmap](release-v1-roadmap.md).

## Phase 0 - Architecture Baseline

Status: done.

- Documentation.
- ADRs.
- Monorepo conventions.
- Coding rules.
- Domain model.
- API design.

## Phase 1 - Foundation

Status: done.

- Monorepo workspace structure.
- Mobile skeleton.
- API skeleton.
- PostgreSQL/Supabase setup.
- Health endpoint.
- Shared contracts baseline.
- Configuration validation baseline.

## Phase 2 - Identity

Status: partial for production.

Done:

- Google login.
- TVLore user creation.
- `GET /users/me`.
- `PATCH /users/me` user settings.
- `DELETE /users/me` account deletion.
- Logout.
- Supabase Auth bearer-token validation.

Missing for v1.0:

- Apple Developer and Supabase Apple provider configuration for release-like Sign in with Apple testing.
- `SUPABASE_SERVICE_ROLE_KEY` configuration in Vercel before account-deletion QA.

## Phase 3 - Catalog and Tracking

Status: done for v1.0.

- TMDB integration.
- Unified search.
- Catalog resolve.
- TV show details.
- Movie details.
- Seasons.
- Episodes.
- Internal TVLore identity strategy.
- Mark episode/movie/season/show watched or unwatched.
- Show progress.
- Personal library.
- Continue watching.
- Cronologia.

## Phase 4 - Taste and Discovery

Status: done for v1.0 baseline.

- Ratings for shows, movies, and episodes.
- Post-watch reflection.
- Cast-based favorite-character picker.
- Where to Watch.
- Recommended picks.
- Available in your country discovery section.
- Popular in your country.
- TVLore Picks.
- Watch Paths.

Post-1.0 candidates:

- Better recommendation ranking.
- Aggregate favorite-character percentages.

## Phase 5 - v1.0 Store Readiness

Status: active target.

Required:

- Sign in with Apple.
- Privacy Policy, Support URL, and account deletion URL.
- App Store privacy answers.
- Google Play Data Safety answers.
- Production EAS build and submit profiles.
- Store metadata, screenshots, app icon, splash, versioning.
- Reviewer instructions.
- Production hardening pass.
- TestFlight and Google Play internal/closed testing.

## Phase 6 - Social / TVLore Match

Status: deferred.

Only start after v1.0 validates the private tracking loop.

Potential future work:

- QR/deep-link profile sharing.
- Privacy controls.
- Ephemeral match tokens.
- Common titles.
- Differences.
- Compatibility.
- Watch-together candidates.
- Friends.
- Shared lists.
- Recommendation exchange.
