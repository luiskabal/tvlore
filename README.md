# TVLore

TVLore is a mobile-first entertainment tracking application for shows, seasons, episodes, and movies.

The architecture baseline lives in [docs/README.md](docs/README.md).
The current infrastructure setup lives in [docs/infrastructure.md](docs/infrastructure.md).

## Current Status

- Product and architecture documentation is complete.
- Monorepo is initialized with API, mobile, and shared contracts packages.
- Backend API is deployed on Vercel at `https://tvlore-api.vercel.app`.
- Expo mobile app can consume the Vercel API from iPhone.
- Supabase and Prisma infrastructure baseline exists; production DB connectivity is verified and migration verification is pending.

## Workspace Layout

```text
apps/
  api/
  mobile/
packages/
  contracts/
docs/
```
