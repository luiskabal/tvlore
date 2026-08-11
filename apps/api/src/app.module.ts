import { MiddlewareConsumer, Module } from "@nestjs/common";

import { SupabaseAuthService } from "./auth/supabase-auth.service";
import { CatalogController, CatalogResolveController, MoviesController, ShowsController } from "./catalog/catalog.controller";
import { CatalogRepository } from "./catalog/catalog.repository";
import { CatalogService } from "./catalog/catalog.service";
import { TmdbClient } from "./catalog/tmdb-client";
import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { ApiConfigProvider } from "./config";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";
import { RootController } from "./root.controller";
import { UsersController } from "./users/users.controller";
import { UsersRepository } from "./users/users.repository";
import { UsersService } from "./users/users.service";

@Module({
  controllers: [
    RootController,
    HealthController,
    UsersController,
    CatalogController,
    CatalogResolveController,
    ShowsController,
    MoviesController,
  ],
  providers: [
    ApiConfigProvider,
    PrismaService,
    SupabaseAuthService,
    CatalogRepository,
    TmdbClient,
    CatalogService,
    UsersRepository,
    UsersService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
