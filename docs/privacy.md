# Privacy

TVLore viewing history is personal data. As TVLore grows toward social comparison, privacy must be part of the architecture from the start.

## Principles

- Privacy is backend-owned.
- The mobile app may present controls but does not enforce canonical privacy.
- Social comparison should reveal derived insights instead of raw history where possible.
- A QR/deep link is not consent to expose all data.
- A user interaction does not imply full mutual visibility.
- Safe defaults matter more than social virality.

## Potential Privacy Controls

Future controls may include:

- Profile visibility.
- Allow comparisons.
- Share watched titles.
- Share ratings.
- Share favorites.
- Share watchlist.
- Share watch dates.
- Allow friend requests.

Do not implement all controls in MVP.

## MVP Defaults

MVP has no social data sharing. Viewing history is private to the authenticated user.

Recommended future defaults:

- Profile visibility: private.
- Allow comparisons: off until enabled.
- Share watched titles: off until enabled.
- Share ratings: off until enabled.
- Share favorites: off until enabled.
- Share watchlist: off until enabled.
- Share watch dates: off by default even if other sharing is enabled.
- Allow friend requests: off until friend features exist.

## Account Deletion

The mobile Profile screen exposes a delete-account action.

Current behavior:

- Deletes the TVLore `User` row.
- Cascades user-owned data such as identities, sessions, watch history, watchlist items, ratings, reflections, and personal watch paths.
- Keeps shared catalog data such as shows, movies, seasons, episodes, external identifiers, and provider metadata.
- Deletes the Supabase Auth user through a backend-only service-role key.

The Supabase service-role key must stay server-side and must never be bundled in the mobile app.

## Match Privacy

For future TVLore Match:

- QR contains only an opaque token.
- Token owner can revoke tokens.
- Tokens expire.
- Backend authenticates the scanning user.
- Backend validates privacy settings.
- Backend calculates the result.
- Backend returns only authorized derived sections.

Example: if users allow comparison but not watch dates, the result may show common titles but omit when each person watched them.

## Raw History Exposure

Avoid returning another user's raw viewing history.

Prefer:

- Counts.
- Common-title lists.
- Difference lists.
- Watch-together candidates.
- Agreement/disagreement summaries.

Only expose raw details if the owner explicitly allows that data category.

## Future Data Rights

Before production, define:

- Watch-history deletion behavior.
- Data export expectations.
- Token revocation behavior.
- Retention for future match/share logs.
