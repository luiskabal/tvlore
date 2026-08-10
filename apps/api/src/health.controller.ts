import { Controller, Get, InternalServerErrorException } from "@nestjs/common";

import { PrismaService } from "./prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

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
    await this.prismaService.ping();

    return {
      status: "ok",
      service: "tvlore-api",
      database: "ok",
      time: new Date().toISOString(),
    };
  }

  @Get("error")
  getHealthError() {
    throw new InternalServerErrorException({
      code: "HEALTH_CHECK_ERROR",
      message: "Health check error",
      details: null,
    });
  }
}
