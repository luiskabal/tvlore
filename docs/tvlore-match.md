# TVLore Match

TVLore Match is a future comparison feature based on authorized viewing profiles.

It is not part of MVP implementation, but architecture should avoid making it hard to add later.

## Core Concept

Conceptual flow:

```text
User A
  -> Generate profile QR / Match Link
  -> TVLore Backend
  -> Temporary/shareable identifier
  -> QR / Deep Link
  -> User B
  -> TVLore Backend
  -> identify both users
  -> validate privacy permissions
  -> compare viewing histories
  -> compare ratings/preferences if available
  -> calculate derived results
  -> Match Result
```

## QR Privacy Rule

The QR code must never contain:

- Viewing history.
- Ratings.
- Email addresses.
- User IDs.
- Google identifiers.
- Authentication credentials.
- Private profile data.

Allowed examples:

```text
tvlore://match/{opaque-token}
https://tvlore.app/m/{opaque-token}
```

The backend resolves the token, authenticates the scanning user, checks privacy, calculates the result, and returns only authorized derived information.

## Possible Results

Future match results may include:

- Taste match percentage.
- Number of titles in common.
- Both watched.
- User A watched / User B has not.
- User B watched / User A has not.
- Biggest agreement.
- Biggest disagreement.
- Watch-together candidates.

This is product direction, not a finalized scoring specification.

## Exploratory Domain Concepts

Potential future concepts:

- `MatchShareToken`
- `MatchSession`
- `MatchResult`
- `ProfilePrivacySettings`
- `Friendship`

Do not create these tables during MVP unless their feature enters scope.

## Model Option A - Ephemeral Comparison

Results are calculated when requested and are not permanently stored.

Pros:

- Lowest storage and privacy footprint.
- Reflects current viewing data and privacy settings.
- Avoids stale compatibility scores.
- Easier to remove access when permissions change.

Cons:

- Result cannot be revisited exactly as originally seen.
- Recalculation cost may grow.
- Sharing a result after the fact is limited.

## Model Option B - Persisted Comparison

A `MatchSession` stores enough information to revisit or share the comparison.

Pros:

- Users can revisit a comparison.
- Can support shareable result pages.
- Can provide stable snapshots.

Cons:

- More privacy risk.
- Requires expiration/deletion policy.
- Scores and common-title lists can become stale.
- Stores derived social data that may not need to exist.

## Recommendation

Prefer ephemeral comparison initially.

Persist only the share token/session metadata required to authorize the flow. Calculate derived results when requested. Avoid permanently storing values such as:

```text
183 common titles
87% compatibility
```

unless a clear product need appears.

## Future Compatibility Algorithm

Do not design an AI recommendation engine.

Version 1 may consider:

- Shared watched titles.
- Intersection size.
- Differences.
- Ratings similarity if ratings exist.
- Favorite overlap.

Future versions may consider:

- Genres.
- Rewatches.
- Completion behavior.
- Abandoned shows.
- Recency.
- Rating confidence.

The algorithm must remain:

- Backend-owned.
- Explainable.
- Deterministic enough to test.
- Privacy-aware.

Avoid black-box AI until the product requires it.

## Authorization

The backend must check:

- The link/token is valid.
- The token is not expired or revoked.
- The scanning user is authenticated.
- The token owner allows comparisons.
- The scanning user is allowed to participate.
- Each data category is permitted by privacy settings.

The result should reveal derived insight instead of raw private history whenever possible.

