export type ApiConfig = {
  databaseUrl?: string;
  port: number;
};

export function getConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    databaseUrl: parseDatabaseUrl(env.DATABASE_URL),
    port: parsePort(env.PORT),
  };
}

function parsePort(value: string | undefined) {
  if (!value) {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function parseDatabaseUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string");
  }

  return value;
}
