import { Injectable } from "@nestjs/common";

import { parseTvloreId } from "../catalog/catalog-detail";
import { UsersService } from "../users/users.service";
import { parseWatchInput } from "./tracking-input";
import { TrackingRepository } from "./tracking.repository";
import type { EpisodeWatchResponseDto, MovieWatchResponseDto } from "./tracking.types";

@Injectable()
export class TrackingService {
  constructor(
    private readonly trackingRepository: TrackingRepository,
    private readonly usersService: UsersService,
  ) {}

  async markEpisodeWatched(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
    body: unknown,
  ): Promise<EpisodeWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const input = parseWatchInput(body);

    return this.trackingRepository.markEpisodeWatched(user.id, parseTvloreId(episodeId, "episodeId"), input.watchedAt);
  }

  async unmarkEpisodeWatched(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
  ): Promise<EpisodeWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.trackingRepository.unmarkEpisodeWatched(user.id, parseTvloreId(episodeId, "episodeId"));
  }

  async markMovieWatched(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
    body: unknown,
  ): Promise<MovieWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const input = parseWatchInput(body);

    return this.trackingRepository.markMovieWatched(user.id, parseTvloreId(movieId, "movieId"), input.watchedAt);
  }

  async unmarkMovieWatched(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<MovieWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.trackingRepository.unmarkMovieWatched(user.id, parseTvloreId(movieId, "movieId"));
  }
}
