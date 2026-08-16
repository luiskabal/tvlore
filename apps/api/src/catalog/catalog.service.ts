import { Injectable, NotFoundException } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { parseSeasonNumber, parseTvloreId } from "./catalog-detail";
import { parseCatalogResolveInput } from "./catalog-resolve";
import { parseCatalogSearchInput } from "./catalog-search";
import { parseWatchCountry } from "./catalog-watch-providers";
import type {
  CatalogCastResponseDto,
  CatalogResolveResponseDto,
  CatalogSearchResponseDto,
  EpisodeDetailResponseDto,
  MovieDetailResponseDto,
  ShowDetailResponseDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonsResponseDto,
  WatchProvidersResponseDto,
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
    const user = await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const show = await this.catalogRepository.findShowDetail(parsedShowId, user.id);

    if (!show) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return this.refreshShowPublicRating(parsedShowId, user.id, show);
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

    return this.refreshMoviePublicRating(parsedMovieId, user.id, movie);
  }

  async getShowWatchProviders(
    authorizationHeader: string | undefined,
    showId: string | undefined,
    country: string | undefined,
  ): Promise<WatchProvidersResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const parsedCountry = parseWatchCountry(country);
    const providerShowId = await this.catalogRepository.findShowProviderId(parsedShowId);

    if (!providerShowId) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return this.tmdbClient.getWatchProviders("show", providerShowId, parsedCountry);
  }

  async getShowCast(
    authorizationHeader: string | undefined,
    showId: string | undefined,
  ): Promise<CatalogCastResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedShowId = parseTvloreId(showId, "showId");
    const providerShowId = await this.catalogRepository.findShowProviderId(parsedShowId);

    if (!providerShowId) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return this.tmdbClient.getShowCast(providerShowId);
  }

  async getMovieWatchProviders(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
    country: string | undefined,
  ): Promise<WatchProvidersResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedMovieId = parseTvloreId(movieId, "movieId");
    const parsedCountry = parseWatchCountry(country);
    const providerMovieId = await this.catalogRepository.findMovieProviderId(parsedMovieId);

    if (!providerMovieId) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    return this.tmdbClient.getWatchProviders("movie", providerMovieId, parsedCountry);
  }

  async getMovieCast(
    authorizationHeader: string | undefined,
    movieId: string | undefined,
  ): Promise<CatalogCastResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedMovieId = parseTvloreId(movieId, "movieId");
    const providerMovieId = await this.catalogRepository.findMovieProviderId(parsedMovieId);

    if (!providerMovieId) {
      throwNotFound("MOVIE_NOT_FOUND", "Movie was not found");
    }

    return this.tmdbClient.getMovieCast(providerMovieId);
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

  async getEpisode(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
  ): Promise<EpisodeDetailResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const parsedEpisodeId = parseTvloreId(episodeId, "episodeId");
    const episode = await this.catalogRepository.findEpisodeDetail(parsedEpisodeId, user.id);

    if (!episode) {
      throwNotFound("EPISODE_NOT_FOUND", "Episode was not found");
    }

    return episode;
  }

  async getEpisodeCast(
    authorizationHeader: string | undefined,
    episodeId: string | undefined,
  ): Promise<CatalogCastResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    const parsedEpisodeId = parseTvloreId(episodeId, "episodeId");
    const episode = await this.catalogRepository.findEpisodeCastRef(parsedEpisodeId);

    if (!episode) {
      throwNotFound("EPISODE_NOT_FOUND", "Episode was not found");
    }

    const providerShowId = await this.catalogRepository.findShowProviderId(episode.showId);

    if (!providerShowId) {
      throwNotFound("SHOW_NOT_FOUND", "Show was not found");
    }

    return this.tmdbClient.getEpisodeCast(providerShowId, episode.seasonNumber, episode.episodeNumber);
  }

  private async refreshShowPublicRating(showId: string, userId: string, show: ShowDetailResponseDto) {
    if (show.publicRating !== null) {
      return show;
    }

    const providerId = await this.catalogRepository.findShowProviderId(showId);

    if (!providerId) {
      return show;
    }

    try {
      await this.catalogRepository.upsertResolvedItem(await this.tmdbClient.getResolvedItem({
        mediaType: "show",
        provider: "tmdb",
        providerId,
      }));

      return await this.catalogRepository.findShowDetail(showId, userId) ?? show;
    } catch {
      return show;
    }
  }

  private async refreshMoviePublicRating(movieId: string, userId: string, movie: MovieDetailResponseDto) {
    if (movie.publicRating !== null) {
      return movie;
    }

    const providerId = await this.catalogRepository.findMovieProviderId(movieId);

    if (!providerId) {
      return movie;
    }

    try {
      await this.catalogRepository.upsertResolvedItem(await this.tmdbClient.getResolvedItem({
        mediaType: "movie",
        provider: "tmdb",
        providerId,
      }));

      return await this.catalogRepository.findMovieDetail(movieId, userId) ?? movie;
    } catch {
      return movie;
    }
  }
}

function throwNotFound(code: string, message: string): never {
  throw new NotFoundException({
    code,
    message,
    details: null,
  });
}
