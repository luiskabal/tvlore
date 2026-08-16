import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";

import { ReflectionsService } from "./reflections.service";
import type { WatchReflectionResponseDto } from "./reflections.types";

@Controller("shows")
export class ShowReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  @Put(":showId/reflection")
  @HttpCode(HttpStatus.OK)
  setReflection(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
    @Body() body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    return this.reflectionsService.setShowReflection(authorizationHeader, showId, body);
  }
}

@Controller("movies")
export class MovieReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  @Put(":movieId/reflection")
  @HttpCode(HttpStatus.OK)
  setReflection(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
    @Body() body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    return this.reflectionsService.setMovieReflection(authorizationHeader, movieId, body);
  }
}

@Controller("episodes")
export class EpisodeReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  @Put(":episodeId/reflection")
  @HttpCode(HttpStatus.OK)
  setReflection(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("episodeId") episodeId: string | undefined,
    @Body() body: unknown,
  ): Promise<WatchReflectionResponseDto> {
    return this.reflectionsService.setEpisodeReflection(authorizationHeader, episodeId, body);
  }
}
