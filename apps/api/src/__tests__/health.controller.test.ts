import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { afterEach, describe, expect, it } from "vitest";

import { HealthController } from "../health.controller";
import type { PrismaService } from "../prisma.service";

const originalNodeEnv = process.env.NODE_ENV;

describe("HealthController", () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("keeps the synthetic error endpoint available outside production", () => {
    process.env.NODE_ENV = "development";

    expect(() => new HealthController({} as PrismaService).getHealthError())
      .toThrow(InternalServerErrorException);
  });

  it("hides the synthetic error endpoint in production", () => {
    process.env.NODE_ENV = "production";

    expect(() => new HealthController({} as PrismaService).getHealthError())
      .toThrow(NotFoundException);
  });
});
