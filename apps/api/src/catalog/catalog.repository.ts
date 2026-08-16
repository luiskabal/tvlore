import { Injectable } from "@nestjs/common";

import { toShowProgress, type ProgressEpisode } from "../progress";
import { PrismaService } from "../prisma.service";
import type {
  CatalogResolveResponseDto,
  CatalogResolvedItem,
  CatalogResolvedSeason,
  CatalogResolvedSeasonSummary,
  CatalogSearchResultDto,
  MovieDetailResponseDto,
  ShowDetailResponseDto,
  ShowEpisodeDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonsResponseDto,
  ShowSeasonSummaryDto,
} from "./catalog.types";

@Injectable()
export class CatalogRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsertResolvedItem(item: CatalogResolvedItem): Promise<CatalogResolveResponseDto> {
    if (item.mediaType === "show") {
      return this.upsertShow(item);
    }

    return this.upsertMovie(item);
  }

  async withExistingTvloreIds(results: CatalogSearchResultDto[]): Promise<CatalogSearchResultDto[]> {
    if (results.length === 0) {
      return results;
    }

    const identifiers = await this.prismaService.getClient().externalIdentifier.findMany({
      where: {
        OR: results.map((result) => ({
          entityType: result.mediaType,
          provider: result.externalRef.provider,
          providerId: result.externalRef.providerId,
        })),
      },
    });
    const idByProviderRef = new Map(identifiers.map((identifier) => [
      getProviderRefKey(identifier.entityType, identifier.provider, identifier.providerId),
      identifier.entityId,
    ]));

    return results.map((result) => ({
      ...result,
      tvloreId: idByProviderRef.get(getProviderRefKey(result.mediaType, result.externalRef.provider, result.externalRef.providerId)) ?? null,
    }));
  }

  async findShowDetail(showId: string, userId: string): Promise<ShowDetailResponseDto | null> {
    const show = await this.prismaService.getClient().show.findUnique({
      include: {
        preferences: {
          select: { rating: true },
          take: 1,
          where: { userId },
        },
        seasons: {
          include: {
            episodes: {
              orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
              select: {
                episodeNumber: true,
                id: true,
                seasonNumber: true,
                title: true,
                watches: {
                  select: { watchedAt: true },
                  take: 1,
                  where: { userId },
                },
              },
            },
          },
          orderBy: { seasonNumber: "asc" },
        },
        watchlistItems: {
          select: { createdAt: true },
          take: 1,
          where: { userId },
        },
      },
      where: { id: showId },
    });

    return show ? toShowDetailResponse(show) : null;
  }

  async findMovieDetail(movieId: string, userId: string): Promise<MovieDetailResponseDto | null> {
    const movie = await this.prismaService.getClient().movie.findUnique({
      include: {
        preferences: {
          select: { rating: true },
          take: 1,
          where: { userId },
        },
        watchlistItems: {
          select: { createdAt: true },
          take: 1,
          where: { userId },
        },
        watches: {
          orderBy: { watchedAt: "desc" },
          take: 1,
          where: { userId },
        },
      },
      where: { id: movieId },
    });

    return movie ? toMovieDetailResponse(movie) : null;
  }

  async findShowProviderId(showId: string): Promise<string | null> {
    const identifier = await this.prismaService.getClient().externalIdentifier.findFirst({
      select: { providerId: true },
      where: {
        entityId: showId,
        entityType: "show",
        provider: "tmdb",
      },
    });

    return identifier?.providerId ?? null;
  }

  async findMovieProviderId(movieId: string): Promise<string | null> {
    const identifier = await this.prismaService.getClient().externalIdentifier.findFirst({
      select: { providerId: true },
      where: {
        entityId: movieId,
        entityType: "movie",
        provider: "tmdb",
      },
    });

    return identifier?.providerId ?? null;
  }

  async findShowSeasons(showId: string): Promise<ShowSeasonsResponseDto | null> {
    const show = await this.prismaService.getClient().show.findUnique({
      include: {
        seasons: { orderBy: { seasonNumber: "asc" } },
      },
      where: { id: showId },
    });

    return show
      ? {
          seasons: show.seasons.map(toSeasonSummaryResponse),
          showId: show.id,
        }
      : null;
  }

  async findSeasonDetail(showId: string, seasonNumber: number, userId: string): Promise<ShowSeasonDetailResponseDto | null> {
    const season = await this.prismaService.getClient().season.findUnique({
      include: {
        episodes: {
          include: {
            watches: {
              orderBy: { watchedAt: "desc" },
              take: 1,
              where: { userId },
            },
          },
          orderBy: { episodeNumber: "asc" },
        },
      },
      where: {
        showId_seasonNumber: {
          seasonNumber,
          showId,
        },
      },
    });

    return season ? toSeasonDetailResponse(season) : null;
  }

  async upsertSeasonDetail(showId: string, season: CatalogResolvedSeason): Promise<void> {
    const client = this.prismaService.getClient();

    await client.$transaction(async (transaction) => {
      const storedSeason = await transaction.season.upsert({
        create: {
          ...getSeasonData(season),
          showId,
        },
        update: getSeasonData(season),
        where: {
          showId_seasonNumber: {
            seasonNumber: season.seasonNumber,
            showId,
          },
        },
      });

      for (const episode of season.episodes) {
        await transaction.episode.upsert({
          create: {
            airDate: toDate(episode.airDate),
            episodeNumber: episode.episodeNumber,
            overview: episode.overview,
            runtimeMinutes: episode.runtimeMinutes,
            seasonId: storedSeason.id,
            seasonNumber: episode.seasonNumber,
            showId,
            stillPath: episode.stillPath,
            title: episode.title,
          },
          update: {
            airDate: toDate(episode.airDate),
            overview: episode.overview,
            runtimeMinutes: episode.runtimeMinutes,
            seasonId: storedSeason.id,
            stillPath: episode.stillPath,
            title: episode.title,
          },
          where: {
            showId_seasonNumber_episodeNumber: {
              episodeNumber: episode.episodeNumber,
              seasonNumber: episode.seasonNumber,
              showId,
            },
          },
        });
      }
    });
  }

  private async upsertShow(item: CatalogResolvedItem): Promise<CatalogResolveResponseDto> {
    const client = this.prismaService.getClient();

    return client.$transaction(async (transaction) => {
      const existingIdentifier = await transaction.externalIdentifier.findUnique({
        where: {
          entityType_provider_providerId: getIdentifierKey(item),
        },
      });
      const data = {
        backdropPath: item.backdropPath,
        firstAirDate: toDate(item.firstAirDate),
        genreNames: item.genreNames,
        originalTitle: item.originalTitle,
        overview: item.overview,
        posterPath: item.posterPath,
        publicRating: item.publicRating,
        title: item.title,
      };

      if (existingIdentifier) {
        const show = await transaction.show.update({
          data,
          where: { id: existingIdentifier.entityId },
        });
        await upsertSeasonSummaries(transaction, show.id, item.seasons);

        return { id: show.id, mediaType: "show" };
      }

      const show = await transaction.show.create({ data });
      await upsertSeasonSummaries(transaction, show.id, item.seasons);
      await transaction.externalIdentifier.create({
        data: {
          ...getIdentifierKey(item),
          entityId: show.id,
        },
      });

      return { id: show.id, mediaType: "show" };
    });
  }

  private async upsertMovie(item: CatalogResolvedItem): Promise<CatalogResolveResponseDto> {
    const client = this.prismaService.getClient();

    return client.$transaction(async (transaction) => {
      const existingIdentifier = await transaction.externalIdentifier.findUnique({
        where: {
          entityType_provider_providerId: getIdentifierKey(item),
        },
      });
      const data = {
        backdropPath: item.backdropPath,
        genreNames: item.genreNames,
        originalTitle: item.originalTitle,
        overview: item.overview,
        posterPath: item.posterPath,
        publicRating: item.publicRating,
        releaseDate: toDate(item.releaseDate),
        runtimeMinutes: item.runtimeMinutes,
        title: item.title,
      };

      if (existingIdentifier) {
        const movie = await transaction.movie.update({
          data,
          where: { id: existingIdentifier.entityId },
        });

        return { id: movie.id, mediaType: "movie" };
      }

      const movie = await transaction.movie.create({ data });
      await transaction.externalIdentifier.create({
        data: {
          ...getIdentifierKey(item),
          entityId: movie.id,
        },
      });

      return { id: movie.id, mediaType: "movie" };
    });
  }
}

function getSeasonData(season: CatalogResolvedSeasonSummary) {
  return {
    airDate: toDate(season.airDate),
    episodeCount: season.episodeCount,
    overview: season.overview,
    posterPath: season.posterPath,
    seasonNumber: season.seasonNumber,
    title: season.title,
  };
}

function getIdentifierKey(item: CatalogResolvedItem) {
  return {
    entityType: item.mediaType,
    provider: item.externalRef.provider,
    providerId: item.externalRef.providerId,
  };
}

function getProviderRefKey(entityType: string, provider: string, providerId: string) {
  return `${entityType}:${provider}:${providerId}`;
}

function toDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function upsertSeasonSummaries(
  transaction: {
    season: {
      upsert(input: {
        create: ReturnType<typeof getSeasonData> & { showId: string };
        update: ReturnType<typeof getSeasonData>;
        where: { showId_seasonNumber: { seasonNumber: number; showId: string } };
      }): Promise<unknown>;
    };
  },
  showId: string,
  seasons: CatalogResolvedSeasonSummary[],
) {
  for (const season of seasons) {
    await transaction.season.upsert({
      create: {
        ...getSeasonData(season),
        showId,
      },
      update: getSeasonData(season),
      where: {
        showId_seasonNumber: {
          seasonNumber: season.seasonNumber,
          showId,
        },
      },
    });
  }
}

function toShowDetailResponse(show: {
  backdropPath: string | null;
  firstAirDate: Date | null;
  id: string;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  preferences: Array<{ rating: number }>;
  publicRating: number | null;
  seasons: Array<Parameters<typeof toSeasonSummaryResponse>[0] & { episodes: ProgressEpisode[] }>;
  title: string;
  watchlistItems: Array<{ createdAt: Date }>;
}): ShowDetailResponseDto {
  return {
    backdropPath: show.backdropPath,
    firstAirDate: toDateString(show.firstAirDate),
    id: show.id,
    inWatchlist: show.watchlistItems.length > 0,
    originalTitle: show.originalTitle,
    overview: show.overview,
    posterPath: show.posterPath,
    progress: toShowProgress(show),
    publicRating: show.publicRating,
    rating: show.preferences[0]?.rating ?? null,
    seasons: show.seasons.map(toSeasonSummaryResponse),
    title: show.title,
  };
}

function toMovieDetailResponse(movie: {
  backdropPath: string | null;
  id: string;
  originalTitle: string | null;
  overview: string;
  posterPath: string | null;
  preferences: Array<{ rating: number }>;
  publicRating: number | null;
  releaseDate: Date | null;
  runtimeMinutes: number | null;
  title: string;
  watchlistItems: Array<{ createdAt: Date }>;
  watches: Array<{ watchedAt: Date }>;
}): MovieDetailResponseDto {
  const watch = movie.watches[0];

  return {
    backdropPath: movie.backdropPath,
    id: movie.id,
    inWatchlist: movie.watchlistItems.length > 0,
    lastWatchedAt: watch ? watch.watchedAt.toISOString() : null,
    originalTitle: movie.originalTitle,
    overview: movie.overview,
    posterPath: movie.posterPath,
    publicRating: movie.publicRating,
    rating: movie.preferences[0]?.rating ?? null,
    releaseDate: toDateString(movie.releaseDate),
    runtimeMinutes: movie.runtimeMinutes,
    title: movie.title,
    watchCount: watch ? 1 : 0,
    watched: Boolean(watch),
  };
}

function toSeasonSummaryResponse(season: {
  airDate: Date | null;
  episodeCount: number;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  title: string;
}): ShowSeasonSummaryDto {
  return {
    airDate: toDateString(season.airDate),
    episodeCount: season.episodeCount,
    id: season.id,
    overview: season.overview,
    posterPath: season.posterPath,
    seasonNumber: season.seasonNumber,
    title: season.title,
  };
}

function toSeasonDetailResponse(season: {
  airDate: Date | null;
  episodeCount: number;
  episodes: Array<{
    airDate: Date | null;
    episodeNumber: number;
    id: string;
    overview: string;
    runtimeMinutes: number | null;
    seasonNumber: number;
    stillPath: string | null;
    title: string;
    watches: Array<{ watchedAt: Date }>;
  }>;
  id: string;
  overview: string;
  posterPath: string | null;
  seasonNumber: number;
  showId: string;
  title: string;
}): ShowSeasonDetailResponseDto {
  return {
    ...toSeasonSummaryResponse(season),
    episodes: season.episodes.map(toEpisodeResponse),
    showId: season.showId,
  };
}

function toEpisodeResponse(episode: {
  airDate: Date | null;
  episodeNumber: number;
  id: string;
  overview: string;
  runtimeMinutes: number | null;
  seasonNumber: number;
  stillPath: string | null;
  title: string;
  watches: Array<{ watchedAt: Date }>;
}): ShowEpisodeDto {
  const watch = episode.watches[0];

  return {
    airDate: toDateString(episode.airDate),
    episodeNumber: episode.episodeNumber,
    id: episode.id,
    lastWatchedAt: watch ? watch.watchedAt.toISOString() : null,
    overview: episode.overview,
    runtimeMinutes: episode.runtimeMinutes,
    seasonNumber: episode.seasonNumber,
    stillPath: episode.stillPath,
    title: episode.title,
    watchCount: watch ? 1 : 0,
    watched: Boolean(watch),
  };
}

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}
