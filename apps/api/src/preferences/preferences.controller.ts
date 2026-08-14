import { Body, Controller, Delete, Headers, HttpCode, HttpStatus, Param, Put } from "@nestjs/common";

import { PreferencesService } from "./preferences.service";
import type { PreferenceMutationResponseDto } from "./preferences.types";

@Controller("shows")
export class ShowPreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Put(":showId/preference")
  @HttpCode(HttpStatus.OK)
  setRating(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
    @Body() body: unknown,
  ): Promise<PreferenceMutationResponseDto> {
    return this.preferencesService.setShowRating(authorizationHeader, showId, body);
  }

  @Delete(":showId/preference")
  @HttpCode(HttpStatus.OK)
  clearRating(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("showId") showId: string | undefined,
  ): Promise<PreferenceMutationResponseDto> {
    return this.preferencesService.clearShowRating(authorizationHeader, showId);
  }
}

@Controller("movies")
export class MoviePreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Put(":movieId/preference")
  @HttpCode(HttpStatus.OK)
  setRating(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
    @Body() body: unknown,
  ): Promise<PreferenceMutationResponseDto> {
    return this.preferencesService.setMovieRating(authorizationHeader, movieId, body);
  }

  @Delete(":movieId/preference")
  @HttpCode(HttpStatus.OK)
  clearRating(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Param("movieId") movieId: string | undefined,
  ): Promise<PreferenceMutationResponseDto> {
    return this.preferencesService.clearMovieRating(authorizationHeader, movieId);
  }
}
