import type { Provider } from "@nestjs/common";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type ApiConfig = {
  databaseUrl: string;
  nodeEnv: string;
  port: number;
  rateLimit: {
    api: RateLimitConfig;
    provider: RateLimitConfig;
  };
  supabasePublishableKey: string;
  supabaseServiceRoleKey: string | null;
  supabaseUrl: string;
  tmdbAccessToken: string;
};

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export const API_CONFIG = Symbol("API_CONFIG");

export const ApiConfigProvider: Provider<ApiConfig> = {
  provide: API_CONFIG,
  useFactory: getConfig,
};

export function getConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  loadLocalEnv();

  return {
    databaseUrl: parseDatabaseUrl(env.DATABASE_URL),
    nodeEnv: parseOptionalString(env.NODE_ENV) ?? "development",
    port: parsePort(env.PORT),
    rateLimit: {
      api: {
        maxRequests: parsePositiveInteger(env.API_RATE_LIMIT_MAX_REQUESTS, "API_RATE_LIMIT_MAX_REQUESTS", 180),
        windowMs: parsePositiveInteger(env.API_RATE_LIMIT_WINDOW_SECONDS, "API_RATE_LIMIT_WINDOW_SECONDS", 60) * 1000,
      },
      provider: {
        maxRequests: parsePositiveInteger(env.PROVIDER_RATE_LIMIT_MAX_REQUESTS, "PROVIDER_RATE_LIMIT_MAX_REQUESTS", 40),
        windowMs: parsePositiveInteger(env.PROVIDER_RATE_LIMIT_WINDOW_SECONDS, "PROVIDER_RATE_LIMIT_WINDOW_SECONDS", 60) * 1000,
      },
    },
    supabasePublishableKey: parseRequiredString(env.SUPABASE_PUBLISHABLE_KEY, "SUPABASE_PUBLISHABLE_KEY"),
    supabaseServiceRoleKey: parseOptionalString(env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrl: parseUrl(env.SUPABASE_URL, "SUPABASE_URL"),
    tmdbAccessToken: parseRequiredString(env.TMDB_ACCESS_TOKEN, "TMDB_ACCESS_TOKEN"),
  };
}

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env");

  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
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
    throw new Error("DATABASE_URL is required");
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

function parseRequiredString(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function parseOptionalString(value: string | undefined) {
  return value?.trim() ? value : null;
}

function parsePositiveInteger(value: string | undefined, name: string, defaultValue: number) {
  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsedValue;
}

function parseUrl(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${name} must be an HTTP URL`);
  }

  return value.replace(/\/$/, "");
}
