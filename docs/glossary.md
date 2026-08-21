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

## Release Terms

- EAS Build: Expo's cloud build service. TVLore uses it to create Android APKs
  for preview QA and Android App Bundles for Google Play.
- APK: Android install package. Useful for direct preview install outside Play,
  but not the preferred upload format for Play production/internal releases.
- AAB: Android App Bundle. The artifact uploaded to Google Play. Play turns it
  into optimized APKs for each device and signs/distributes those APKs.
- Package name: Android's permanent application identifier. TVLore uses
  `com.luiskabal.tvlore`; changing it would create a different app identity.
- Version code: Android's monotonically increasing release number. Every Play
  upload must use a higher version code than previous uploads.
- Version name: Human-readable app version, such as `1.0.0`.
- Internal testing: Google Play track for quickly sharing a build with invited
  trusted testers. It proves Play-distributed installability before wider tests.
- Closed testing: Google Play track for a controlled larger test group. New
  personal developer accounts may need a closed test with enough opted-in
  testers for enough time before production access.
- Opt-in link: Google Play URL a tester opens to join a testing track before
  installing the test app.
- Play propagation: delay between a release being active in Play Console and
  the install surface being available to every tester/device/account.
- Release candidate: a build that is feature-frozen enough for final QA and
  store-review preparation.
- Deobfuscation mapping: file that lets Play translate minified Android crash
  stack traces back to readable source names. Non-blocking for internal testing,
  useful before production hardening if obfuscation/minification is enabled.
- App access notes: store-review instructions explaining how reviewers can sign
  in and test protected app functionality. Credentials belong in the store
  console only, never in git.
