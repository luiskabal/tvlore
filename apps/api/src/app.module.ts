import { MiddlewareConsumer, Module } from "@nestjs/common";

import { SupabaseAuthService } from "./auth/supabase-auth.service";
import { CatalogController, CatalogResolveController, MoviesController, ShowsController } from "./catalog/catalog.controller";
import { CatalogRepository } from "./catalog/catalog.repository";
import { CatalogService } from "./catalog/catalog.service";
import { TmdbClient } from "./catalog/tmdb-client";
import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { ApiConfigProvider } from "./config";
import { HealthController } from "./health.controller";
import { LibraryController, ShowProgressController } from "./library/library.controller";
import { LibraryRepository } from "./library/library.repository";
import { LibraryService } from "./library/library.service";
import { PrismaService } from "./prisma.service";
import { RootController } from "./root.controller";
import { EpisodeTrackingController, MovieTrackingController } from "./tracking/tracking.controller";
import { TrackingRepository } from "./tracking/tracking.repository";
import { TrackingService } from "./tracking/tracking.service";
import { UsersController } from "./users/users.controller";
import { UsersRepository } from "./users/users.repository";
import { UsersService } from "./users/users.service";
import { MovieWatchlistController, ShowWatchlistController } from "./watchlist/watchlist.controller";
import { WatchlistRepository } from "./watchlist/watchlist.repository";
import { WatchlistService } from "./watchlist/watchlist.service";

@Module({
  controllers: [
    RootController,
    HealthController,
    UsersController,
    CatalogController,
    CatalogResolveController,
    ShowsController,
    MoviesController,
    EpisodeTrackingController,
    MovieTrackingController,
    ShowWatchlistController,
    MovieWatchlistController,
    LibraryController,
    ShowProgressController,
  ],
  providers: [
    ApiConfigProvider,
    PrismaService,
    SupabaseAuthService,
    CatalogRepository,
    TrackingRepository,
    WatchlistRepository,
    LibraryRepository,
    TmdbClient,
    CatalogService,
    TrackingService,
    WatchlistService,
    LibraryService,
    UsersRepository,
    UsersService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
