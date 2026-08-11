import { Injectable, NotFoundException } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { parseSeasonNumber, parseTvloreId } from "./catalog-detail";
import { parseCatalogResolveInput } from "./catalog-resolve";
import { parseCatalogSearchInput } from "./catalog-search";
import type {
  CatalogResolveResponseDto,
  CatalogSearchResponseDto,
  MovieDetailResponseDto,
  ShowDetailResponseDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonsResponseDto,
} from "./catalog.types";
import { CatalogRepository } from "./catalog.repository";
import { TmdbClient } from "./tmdb-client";

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly tmdbClient: TmdbClient,
    private readonly usersService: UsersService,
  ) {}

  async search(
    authorizationHeader: string | undefined,
    query: string | undefined,
    types: string | undefined,
    page: string | undefined,
  ): Promise<CatalogSearchResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const input = parseCatalogSearchInput({ page, query, types });
    const results = await this.tmdbClient.search(input);

    return {
      page: input.page,
      query: input.query,
      results: await this.catalogRepository.withExistingTvloreIds(results),
    };
  }

  async resolve(
    authorizationHeader: string | undefined,
    body: unknown,
  ): Promise<CatalogResolveResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const input = parseCatalogResolveInput(body);
    const item = await this.tmdbClient.getResolvedItem(input);

    return this.catalogRepository.upsertResolvedItem(item);
  }

  async getShow(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<ShowDetailResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const show = await this.catalogRepository.findShowDetail(parsedShowId);

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return show;
  }

  async getMovie(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<MovieDetailResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    const parsedMovieId = parseTvloreId(movieId, "movieId");
    const movie = await this.catalogRepository.findMovieDetail(parsedMovieId, user.id);

    if (!movie) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    return movie;
  }

  async getShowSeasons(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<ShowSeasonsResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const seasons = await this.catalogRepository.findShowSeasons(parsedShowId);

    if (!seasons) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return seasons;
  }

  async getShowSeason(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    seasonNumber: string | undefined,
  ): Promise<ShowSeasonDetailResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const parsedSeasonNumber = parseSeasonNumber(seasonNumber);
    const providerShowId = await this.catalogRepository.findShowProviderId(parsedShowId);

    if (!providerShowId) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    const season = await this.tmdbClient.getResolvedSeason(providerShowId, parsedSeasonNumber);
    await this.catalogRepository.upsertSeasonDetail(parsedShowId, season);

    const storedSeason = await this.catalogRepository.findSeasonDetail(parsedShowId, parsedSeasonNumber, user.id);

    if (!storedSeason) {
      throwNotFound("SEASON_NOT_FOUND", "Season was not found");
    }

    return storedSeason;
  }
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    message,
    details: null,
  });
}
