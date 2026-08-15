import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";

import { CatalogService } from "./catalog.service";
import type {
  CatalogResolveResponseDto,
  CatalogSearchResponseDto,
  MovieDetailResponseDto,
  ShowDetailResponseDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonsResponseDto,
  WatchProvidersResponseDto,
} from "./catalog.types";

@Controller("search")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  search(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Query("query") query: string | undefined,
    @Query("types") types: string | undefined,
    @Query("page") page: string | undefined,
  ): Promise<CatalogSearchResponseDto> {
    return this.catalogService.search(authorizationHeader, query, types, page);
  }
}

@Controller("catalog")
export class CatalogResolveController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post("resolve")
  @HttpCode(HttpStatus.OK)
  resolve(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<CatalogResolveResponseDto> {
    return this.catalogService.resolve(authorizationHeader, body);
  }
}

@Controller("shows")
export class ShowsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(":showId")
  getShow(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<ShowDetailResponseDto> {
    return this.catalogService.getShow(authorizationHeader, showId);
  }

  @Get(":showId/watch-providers")
  getShowWatchProviders(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
    @Query("country") country: string | undefined,
  ): Promise<WatchProvidersResponseDto> {
    return this.catalogService.getShowWatchProviders(authorizationHeader, showId, country);
  }

  @Get(":showId/seasons")
  getShowSeasons(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<ShowSeasonsResponseDto> {
    return this.catalogService.getShowSeasons(authorizationHeader, showId);
  }

  @Get(":showId/seasons/:seasonNumber")
  getShowSeason(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
    @Param("seasonNumber") seasonNumber: string | undefined,
  ): Promise<ShowSeasonDetailResponseDto> {
    return this.catalogService.getShowSeason(authorizationHeader, showId, seasonNumber);
  }
}

@Controller("movies")
export class MoviesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(":movieId")
  getMovie(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
  ): Promise<MovieDetailResponseDto> {
    return this.catalogService.getMovie(authorizationHeader, movieId);
  }

  @Get(":movieId/watch-providers")
  getMovieWatchProviders(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
    @Query("country") country: string | undefined,
  ): Promise<WatchProvidersResponseDto> {
    return this.catalogService.getMovieWatchProviders(authorizationHeader, movieId, country);
  }
}
