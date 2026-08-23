import { Injectable, NotFoundException } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { parseSeasonNumber, parseTvloreId } from "../catalog/catalog-detail";
import { TmdbClient } from "../catalog/tmdb-client";
import type { ShowProgressResponseDto } from "../progress";
import { UsersService } from "../users/users.service";
import { parseWatchInput } from "./tracking-input";
import { TrackingRepository } from "./tracking.repository";
import type { EpisodeWatchResponseDto, MovieWatchResponseDto, SeasonWatchResponseDto } from "./tracking.types";

@Injectable()
export class TrackingService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly trackingRepository: TrackingRepository,
    private readonly tmdbClient: TmdbClient,
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

  async markShowWatched(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    body: unknown,
  ): Promise<ShowProgressResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const input = parseWatchInput(body);
    const parsedShowId = parseTvloreId(showId, "showId");

    await this.hydrateShowSeasons(parsedShowId);

    return this.trackingRepository.markShowWatched(user.id, parsedShowId, input.watchedAt);
  }

  async unmarkShowWatched(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<ShowProgressResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.trackingRepository.unmarkShowWatched(user.id, parseTvloreId(showId, "showId"));
  }

  async markSeasonWatched(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    seasonNumber: string | undefined,
    body: unknown,
  ): Promise<SeasonWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const input = parseWatchInput(body);
    const parsedShowId = parseTvloreId(showId, "showId");
    const parsedSeasonNumber = parseSeasonNumber(seasonNumber);

    await this.hydrateShowSeason(parsedShowId, parsedSeasonNumber);

    return this.trackingRepository.markSeasonWatched(user.id, parsedShowId, parsedSeasonNumber, input.watchedAt);
  }

  async unmarkSeasonWatched(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    seasonNumber: string | undefined,
  ): Promise<SeasonWatchResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    return this.trackingRepository.unmarkSeasonWatched(
      user.id,
      parseTvloreId(showId, "showId"),
      parseSeasonNumber(seasonNumber),
    );
  }

  private async hydrateShowSeasons(showId: string) {
    const [providerShowId, seasons] = await Promise.all([
      this.catalogRepository.findShowProviderId(showId),
      this.catalogRepository.findShowSeasonHydrationPlan(showId),
    ]);

    if (!providerShowId || !seasons) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    await Promise.all(seasons.seasons.filter((item) => item.seasonNumber > 0).map(async (season) => {
      const seasonDetail = await this.tmdbClient.getResolvedSeason(providerShowId, season.seasonNumber);
      await this.catalogRepository.upsertSeasonDetail(showId, seasonDetail);
    }));
  }

  private async hydrateShowSeason(showId: string, seasonNumber: number) {
    const providerShowId = await this.catalogRepository.findShowProviderId(showId);

    if (!providerShowId) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    const seasonDetail = await this.tmdbClient.getResolvedSeason(providerShowId, seasonNumber);
    await this.catalogRepository.upsertSeasonDetail(showId, seasonDetail);
  }
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    message,
    details: null,
  });
}
