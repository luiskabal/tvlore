import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import type { ApiConfig } from "../config";
import { HealthController } from "../health.controller";
import type { PrismaService } from "../prisma.service";

const config: ApiConfig = {
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/postgres",
  nodeEnv: "development",
  port: 3000,
  rateLimit: {
    api: {
      maxRequests: 180,
      windowMs: 60000,
    },
    provider: {
      maxRequests: 40,
      windowMs: 60000,
    },
  },
  supabasePublishableKey: "publishable",
  supabaseServiceRoleKey: "service-role",
  supabaseUrl: "https://supabase.test",
  tmdbAccessToken: "tmdb",
};

describe("HealthController", () => {
  it("keeps the synthetic error endpoint available outside production", () => {
    expect(() => new HealthController({} as PrismaService, config).getHealthError())
      .toThrow(InternalServerErrorException);
  });

  it("hides the synthetic error endpoint in production", () => {
    expect(() => new HealthController({} as PrismaService, { ...config, nodeEnv: "production" }).getHealthError())
      .toThrow(NotFoundException);
  });
});
