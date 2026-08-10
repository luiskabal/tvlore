import { MiddlewareConsumer, Module } from "@nestjs/common";

import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";
import { RootController } from "./root.controller";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";

@Module({
  controllers: [RootController, HealthController, UsersController],
  providers: [PrismaService, UsersService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
