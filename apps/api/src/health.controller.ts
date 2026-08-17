import { Controller, Get, Inject, InternalServerErrorException, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";

import { API_CONFIG, type ApiConfig } from "./config";
import { PrismaService } from "./prisma.service";

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
  ) {}

  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "tvlore-api",
      time: new Date().toISOString(),
    };
  }

  @Get("db")
  async getDatabaseHealth() {
    try {
      await this.prismaService.ping();
    } catch (error) {
      this.logger.error("Database health check failed", error instanceof Error ? error.stack : String(error));

      throw new ServiceUnavailableException({
        code: "DATABASE_UNAVAILABLE",
        message: "Database health check failed",
        details: null,
      });
    }

    return {
      status: "ok",
      service: "tvlore-api",
      database: "ok",
      time: new Date().toISOString(),
    };
  }

  @Get("error")
  getHealthError() {
    if (this.config.nodeEnv === "production") {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Not found",
        details: null,
      });
    }

    throw new InternalServerErrorException({
      code: "HEALTH_CHECK_ERROR",
      message: "Health check error",
      details: null,
    });
  }
}
