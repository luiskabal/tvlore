# State Management

TVLore mobile state is divided into four categories. This split prevents server-owned data from being copied into client stores and quietly becoming wrong.

## Local UI State

Use React state.

Examples:

- Modal visibility.
- Selected tab.
- Search input.
- Expanded season.
- Temporary filters.
- Component-level loading affordances.

Local state should stay near the component that owns it.

## Server State

Use TanStack Query.

Examples:

- Current user.
- Search results.
- Show details.
- Movie details.
- Seasons.
- Episodes.
- Watch history.
- Progress.
- Library.
- Future match result.

TanStack Query owns:

- Caching.
- Stale data.
- Request lifecycle.
- Loading state.
- Retries.
- Refetch.
- Invalidation.
- Mutations.
- Background refresh.

Do not duplicate server resources into Zustand. Avoid stores such as:

```text
shows[]
episodes[]
watchHistory[]
ratings[]
friends[]
```

Those are backend resources.

## Global Application State

Use Zustand sparingly.

Appropriate examples:

- Theme.
- Onboarding state.
- Ephemeral authentication bootstrap state.
- UI preferences.
- Feature flags already delivered to the client.

Inappropriate examples:

- Show records.
- Episode records.
- Movie records.
- Watch history.
- Progress calculations.
- Ratings.
- Friends.
- Match results that come from the API.

Zustand is not a client-side database.

## Persistent Device State

### SecureStore

Use Expo SecureStore for sensitive values:

- Refresh credentials.
- Sensitive authentication material.

Do not store TMDB credentials or backend secrets in the mobile app at all.

### AsyncStorage

Use AsyncStorage for non-sensitive preferences:

- Theme.
- Onboarding completion.
- Display preferences.
- Non-sensitive local settings.

AsyncStorage is unencrypted. It must not contain tokens, raw viewing history, Google identifiers, or private profile data.

## Mutation Pattern

The mobile app should call mutation hooks such as:

- `useMarkEpisodeWatched()`
- `useMarkEpisodeUnwatched()`
- `useMarkMovieWatched()`
- `useMarkMovieUnwatched()`

Mutation hooks may handle request lifecycle, optimistic UI where safe, query invalidation, and error display mapping.

They must not decide whether a watch is allowed, whether a user owns the resource, or how progress is calculated.

