import { defineConfig } from "prisma/config";

const localDatabaseUrl = "postgresql://tvlore:tvlore@localhost:5432/tvlore?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? localDatabaseUrl,
  },
});
