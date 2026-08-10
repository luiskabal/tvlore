# Glossary

## Product Terms

- Library: the user's personal collection/history surface for watched and tracked titles.
- Watched: a user-specific state indicating the user has completed an episode or movie at least once.
- Watch History: timestamped records of completed watches.
- Progress: backend-calculated completion state for shows, seasons, and movies.
- Continue Watching: a derived list of partially watched shows or active items.
- Profile: a user's private or shareable TVLore identity surface.
- Taste Profile: derived understanding of a user's audiovisual preferences.
- Match: a future comparison between two authorized users' viewing profiles.
- Common Titles: titles both users have watched.
- Watch Together: future suggestions based on titles neither user has watched or titles suitable for both.

## Branding Notes

"Lore" may be explored in product copy:

- My Lore
- Build your Lore
- Compare your Lore

This should remain a UX/branding exploration. Technical/domain concepts should stay plain. Database tables and backend modules do not need marketing names.

## Technical Terms

- TVLore ID: internal UUID owned by TVLore.
- Provider ID: external identifier from a media provider such as TMDB.
- External Identifier: mapping between a TVLore entity and provider-specific IDs.
- Server State: data fetched from and owned by the backend.
- Client State: local UI/application state owned by the mobile app.
- Refresh Session: backend-owned session record that supports refresh-token rotation and revocation.
- Opaque Token: token whose contents are not meaningful to clients.

