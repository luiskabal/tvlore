# Tracking Model

Tracking is TVLore's core domain. The model must support a simple MVP without blocking future taste-profile and comparison features.

## Requirements

The tracking model should answer:

- What has this user watched?
- How many times?
- When?
- What is their current progress?
- What shows did they abandon?
- Which titles do two users share?
- Which titles has only one watched?

The last three influence modeling, but should not create an analytics platform in the MVP.

## Episode Watches

Use an `EpisodeWatch` record for a user watch of an episode.

```text
EpisodeWatch
|-- id
|-- userId
|-- episodeId
|-- watchedAt
`-- createdAt
```

A user has watched an episode if at least one `EpisodeWatch` exists for that user and episode.

Current MVP implementation keeps one active row per `userId + episodeId`.

Therefore:

- `watched = row exists`
- `watchCount = 1` when the row exists, otherwise `0`
- `lastWatchedAt = watchedAt` on that row

## Movie Watches

Use a `MovieWatch` record for a user watch of a movie.

```text
MovieWatch
|-- id
|-- userId
|-- movieId
|-- watchedAt
`-- createdAt
```

A user has watched a movie if at least one `MovieWatch` exists for that user and movie.

Current MVP implementation keeps one active row per `userId + movieId`.

## Watched and Unwatched Semantics

For MVP UI toggles:

- Mark watched: ensure at least one watch record exists.
- Mark unwatched: remove the user's watch records for that episode or movie.

This keeps the initial product behavior intuitive.

Future rewatch-specific UX can add an explicit command such as "Log rewatch" that creates additional watch records without ambiguity.

That future slice can relax the uniqueness constraints and change `watchCount` to a real count. The current toggle behavior intentionally chooses clarity over rewatch history.

If auditability becomes a product or compliance requirement, add a separate correction/audit log later. Do not use a generic event-sourcing model for MVP.

## EpisodeWatch vs Generic WatchEvent

### Option A - Explicit EpisodeWatch and MovieWatch

Pros:

- Simple relational model.
- Easy progress queries.
- Easy uniqueness and indexes.
- Clear domain language.
- Avoids generic event parsing for the MVP.

Cons:

- Requires additional tables for different media types.
- Future audit semantics may require a separate log.

### Option B - Generic WatchEvent

Example:

```text
WatchEvent
|-- userId
|-- mediaType
|-- mediaId
|-- eventType
|-- occurredAt
```

Pros:

- Flexible.
- Can represent watched, unwatched, corrected, imported, and rewatch events.
- Preserves a full event trail.

Cons:

- More complex queries.
- Business state must be derived from event streams.
- Easy to overdesign into event sourcing.
- Progress calculation becomes harder than needed for MVP.

### Decision

Use explicit `EpisodeWatch` and `MovieWatch` records for MVP.

This is enough to support watch status, counts, timestamps, progress, and future comparisons while avoiding premature event-sourcing complexity.

## Progress Calculation

Progress is backend-owned.

The mobile app displays progress returned by the API. It does not calculate canonical completion percentages.

### Episode Progress

For an episode:

- `watched = watchCount > 0`
- `watchCount = 1` if the MVP watch row exists, otherwise `0`
- `lastWatchedAt = watchedAt` on the MVP watch row

### Season Progress

For a season:

```text
watchedEpisodes / totalEligibleEpisodes
```

Initial eligibility rule:

- Count regular episodes in the season.
- Exclude specials by default, usually season `0`, unless TVLore later chooses to expose them.
- Consider unaired future episodes separately so progress does not drop because of future air dates.

The backend owns the final eligibility rule.

### Show Progress

For a show:

```text
watchedEligibleEpisodes / totalEligibleEpisodes
```

Derived fields:

- `watchedEpisodeCount`
- `totalEpisodeCount`
- `percentComplete`
- `nextEpisode`
- `lastWatchedAt`
- `isComplete`

### Movie Progress

For MVP:

- A movie is either watched or unwatched.
- `watchCount` can support future rewatches.
- No partial playback progress is tracked because TVLore does not host or play content.

## Continue Watching

Backend can derive continue-watching candidates from:

- Shows with at least one watched episode.
- Shows that are not complete.
- Recent activity.
- Next eligible episode.

The MVP can keep sorting simple: most recent watched activity first.

## Abandoned Shows

Do not implement abandoned-show detection in MVP.

The model can support it later by evaluating:

- Time since last watched.
- Incomplete progress.
- Number of remaining episodes.
- User explicit "abandoned" state if added.

## Comparison Readiness

The model supports future comparison by allowing backend queries such as:

- Titles both users watched.
- Titles only user A watched.
- Titles only user B watched.
- Shared movies.
- Shared shows with watched episode overlap.
- Watch counts and recency.

Do not expose raw history to another user unless privacy settings allow it. Prefer derived comparison results.
