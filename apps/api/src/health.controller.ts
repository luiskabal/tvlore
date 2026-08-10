import { Controller, Get, InternalServerErrorException } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "tvlore-api",
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
