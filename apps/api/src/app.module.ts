import { MiddlewareConsumer, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { SupabaseAuthService } from "./auth/supabase-auth.service";
import { CatalogController, CatalogResolveController, EpisodesController, MoviesController, ShowsController } from "./catalog/catalog.controller";
import { CatalogRepository } from "./catalog/catalog.repository";
import { CatalogService } from "./catalog/catalog.service";
import { TmdbClient } from "./catalog/tmdb-client";
import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { ApiConfigProvider } from "./config";
import { DiscoveryController } from "./discovery/discovery.controller";
import { DiscoveryService } from "./discovery/discovery.service";
import { HealthController } from "./health.controller";
import { LibraryController, ShowProgressController } from "./library/library.controller";
import { LibraryRepository } from "./library/library.repository";
import { LibraryService } from "./library/library.service";
import { EpisodePreferencesController, MoviePreferencesController, ShowPreferencesController } from "./preferences/preferences.controller";
import { PreferencesRepository } from "./preferences/preferences.repository";
import { PreferencesService } from "./preferences/preferences.service";
import { PrismaService } from "./prisma.service";
import { RateLimitGuard } from "./rate-limit.guard";
import { EpisodeReflectionsController, MovieReflectionsController, ShowReflectionsController } from "./reflections/reflections.controller";
import { ReflectionsRepository } from "./reflections/reflections.repository";
import { ReflectionsService } from "./reflections/reflections.service";
import { RecommendationsController } from "./recommendations/recommendations.controller";
import { RecommendationsRepository } from "./recommendations/recommendations.repository";
import { RecommendationsService } from "./recommendations/recommendations.service";
import { RootController } from "./root.controller";
import { EpisodeTrackingController, MovieTrackingController, ShowTrackingController } from "./tracking/tracking.controller";
import { TrackingRepository } from "./tracking/tracking.repository";
import { TrackingService } from "./tracking/tracking.service";
import { UsersController } from "./users/users.controller";
import { UsersRepository } from "./users/users.repository";
import { UsersService } from "./users/users.service";
import { MovieWatchlistController, ShowWatchlistController } from "./watchlist/watchlist.controller";
import { WatchlistRepository } from "./watchlist/watchlist.repository";
import { WatchlistService } from "./watchlist/watchlist.service";
import { WatchPathsController } from "./watch-paths/watch-paths.controller";
import { WatchPathsRepository } from "./watch-paths/watch-paths.repository";
import { WatchPathsService } from "./watch-paths/watch-paths.service";

@Module({
  controllers: [
    RootController,
    HealthController,
    UsersController,
    CatalogController,
    CatalogResolveController,
    EpisodesController,
    ShowsController,
    MoviesController,
    EpisodeTrackingController,
    MovieTrackingController,
    ShowTrackingController,
    ShowWatchlistController,
    MovieWatchlistController,
    ShowPreferencesController,
    MoviePreferencesController,
    EpisodePreferencesController,
    ShowReflectionsController,
    MovieReflectionsController,
    EpisodeReflectionsController,
    LibraryController,
    ShowProgressController,
    RecommendationsController,
    DiscoveryController,
    WatchPathsController,
  ],
  providers: [
    ApiConfigProvider,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    PrismaService,
    SupabaseAuthService,
    CatalogRepository,
    TrackingRepository,
    WatchlistRepository,
    PreferencesRepository,
    ReflectionsRepository,
    LibraryRepository,
    RecommendationsRepository,
    WatchPathsRepository,
    TmdbClient,
    CatalogService,
    TrackingService,
    WatchlistService,
    PreferencesService,
    ReflectionsService,
    LibraryService,
    RecommendationsService,
    DiscoveryService,
    WatchPathsService,
    UsersRepository,
    UsersService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
