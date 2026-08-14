import { Body, Controller, Delete, Headers, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";

import { TrackingService } from "./tracking.service";
import type { EpisodeWatchResponseDto, MovieWatchResponseDto, ShowWatchResponseDto } from "./tracking.types";

@Controller("episodes")
export class EpisodeTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post(":episodeId/watches")
  @HttpCode(HttpStatus.OK)
  markWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("episodeId") episodeId: string | undefined,
    @Body() body: unknown,
  ): Promise<EpisodeWatchResponseDto> {
    return this.trackingService.markEpisodeWatched(authorizationHeader, episodeId, body);
  }

  @Delete(":episodeId/watches")
  @HttpCode(HttpStatus.OK)
  unmarkWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("episodeId") episodeId: string | undefined,
  ): Promise<EpisodeWatchResponseDto> {
    return this.trackingService.unmarkEpisodeWatched(authorizationHeader, episodeId);
  }
}

@Controller("movies")
export class MovieTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post(":movieId/watches")
  @HttpCode(HttpStatus.OK)
  markWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
    @Body() body: unknown,
  ): Promise<MovieWatchResponseDto> {
    return this.trackingService.markMovieWatched(authorizationHeader, movieId, body);
  }

  @Delete(":movieId/watches")
  @HttpCode(HttpStatus.OK)
  unmarkWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
  ): Promise<MovieWatchResponseDto> {
    return this.trackingService.unmarkMovieWatched(authorizationHeader, movieId);
  }
}

@Controller("shows")
export class ShowTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post(":showId/watches")
  @HttpCode(HttpStatus.OK)
  markWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
    @Body() body: unknown,
  ): Promise<ShowWatchResponseDto> {
    return this.trackingService.markShowWatched(authorizationHeader, showId, body);
  }

  @Delete(":showId/watches")
  @HttpCode(HttpStatus.OK)
  unmarkWatched(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<ShowWatchResponseDto> {
    return this.trackingService.unmarkShowWatched(authorizationHeader, showId);
  }
}
