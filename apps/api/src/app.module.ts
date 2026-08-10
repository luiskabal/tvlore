import { MiddlewareConsumer, Module } from "@nestjs/common";

import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { HealthController } from "./health.controller";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";

@Module({
  controllers: [HealthController, UsersController],
  providers: [UsersService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
