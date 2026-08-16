import { Injectable } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { parseRatingInput } from "./preferences-input";
import { PreferencesRepository } from "./preferences.repository";
import type { PreferenceMutationResponseDto } from "./preferences.types";

@Injectable()
export class PreferencesService {
  constructor(
    private readonly preferencesRepository: PreferencesRepository,
    private readonly usersService: UsersService,
  ) {}

  async setShowRating(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    body: unknown,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.setShowRating(
      user.id,
      parseTvloreId(showId, "showId"),
      parseRatingInput(body),
    );
  }

  async clearShowRating(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.clearShowRating(user.id, parseTvloreId(showId, "showId"));
  }

  async setMovieRating(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
    body: unknown,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.setMovieRating(
      user.id,
      parseTvloreId(movieId, "movieId"),
      parseRatingInput(body),
    );
  }

  async clearMovieRating(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.clearMovieRating(user.id, parseTvloreId(movieId, "movieId"));
  }

  async setEpisodeRating(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
    body: unknown,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.setEpisodeRating(
      user.id,
      parseTvloreId(episodeId, "episodeId"),
      parseRatingInput(body),
    );
  }

  async clearEpisodeRating(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
  ): Promise<PreferenceMutationResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.preferencesRepository.clearEpisodeRating(user.id, parseTvloreId(episodeId, "episodeId"));
  }
}
