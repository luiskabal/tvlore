# MVP Scope

The MVP proves that TVLore can authenticate a user, search catalog content, create durable internal references, track watches, and calculate basic progress.

## In Scope

The first meaningful end-to-end milestone is:

1. Launch TVLore.
2. Authenticate with Google.
3. Retrieve the authenticated TVLore user.
4. Search TV shows and movies.
5. Open TV show details.
6. Browse seasons and episodes.
7. Open movie details.
8. Mark episodes as watched or unwatched.
9. Mark movies as watched or unwatched.
10. Display basic viewing progress.
11. Display a simple personal library/profile summary.

## Out of Scope

The MVP explicitly does not include:

- Traditional social feed.
- Comments.
- Followers.
- Direct messages.
- Friend system.
- QR matching implementation.
- Compatibility scoring implementation.
- Shared watchlists.
- Ratings.
- Advanced statistics.
- Recommendations.
- AI.
- Push notifications.
- Widgets.
- Offline-first synchronization.
- Background synchronization beyond normal query refresh.
- Trakt integration.
- TVmaze integration.
- TheTVDB integration.
- Streaming playback.
- Content hosting.
- Redis.
- Kafka.
- Queues.
- Microservices.
- Kubernetes.
- Web frontend.
- Admin panel.
- Subscriptions.
- Payments.

Some of these may appear in future roadmap phases. They should not inflate the first implementation.

## MVP Success Criteria

- A Google-authenticated user can create a TVLore account.
- The mobile app can call authenticated API endpoints.
- Search returns unified show/movie results from TMDB through the backend.
- A selected TMDB title can be represented as a TVLore-owned internal entity.
- Episode and movie watches survive app reinstall and device change.
- Progress is calculated by the backend and displayed by the mobile app.
- The library/profile summary is driven by backend-owned data.

## Non-Goals

- The MVP does not validate the social product loop.
- The MVP does not need an advanced taste model.
- The MVP does not need offline mutation queues.
- The MVP does not need complex analytics.

## Smallest Next Implementation Task

After Phase 0 documentation, the smallest implementation task should be:

> Initialize the monorepo workspace structure and root package-manager configuration only.

Do not implement API endpoints, mobile screens, database migrations, or authentication in that same task.

