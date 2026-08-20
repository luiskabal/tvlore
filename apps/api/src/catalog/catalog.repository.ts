import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma.service";
import type {
  CatalogResolveResponseDto,
  CatalogResolvedItem,
  CatalogResolvedSeason,
  CatalogResolvedSeasonSummary,
  CatalogSearchResultDto,
  EpisodeDetailResponseDto,
  MovieDetailResponseDto,
  ShowDetailResponseDto,
  ShowSeasonHydrationPlanDto,
  ShowSeasonDetailResponseDto,
  ShowSeasonsResponseDto,
} from "./catalog.types";
import {
  toEpisodeDetailResponse,
  toMovieDetailResponse,
  toSeasonDetailResponse,
  toSeasonSummaryResponse,
  toShowDetailResponse,
} from "./catalog-response.mapper";

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
        reflections: {
          select: {
            comment: true,
            favoriteCharacter: true,
            reaction: true,
            updatedAt: true,
          },
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
        reflections: {
          select: {
            comment: true,
            favoriteCharacter: true,
            reaction: true,
            updatedAt: true,
          },
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

  async findEpisodeCastRef(episodeId: string): Promise<{ episodeNumber: number; seasonNumber: number; showId: string } | null> {
    const episode = await this.prismaService.getClient().episode.findUnique({
      select: {
        episodeNumber: true,
        seasonNumber: true,
        showId: true,
      },
      where: { id: episodeId },
    });

    return episode;
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

  async findShowSeasonHydrationPlan(showId: string): Promise<ShowSeasonHydrationPlanDto | null> {
    const show = await this.prismaService.getClient().show.findUnique({
      select: {
        id: true,
        seasons: {
          orderBy: { seasonNumber: "asc" },
          select: {
            _count: {
              select: { episodes: true },
            },
            episodeCount: true,
            seasonNumber: true,
          },
        },
      },
      where: { id: showId },
    });

    return show
      ? {
          seasons: show.seasons
            .filter((season) => season.episodeCount > 0 && season._count.episodes < season.episodeCount)
            .map((season) => ({
              episodeCount: season.episodeCount,
              seasonNumber: season.seasonNumber,
              storedEpisodeCount: season._count.episodes,
            })),
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
        show: {
          select: {
            title: true,
          },
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

  async findEpisodeDetail(episodeId: string, userId: string): Promise<EpisodeDetailResponseDto | null> {
    const episode = await this.prismaService.getClient().episode.findUnique({
      include: {
        preferences: {
          select: { rating: true },
          take: 1,
          where: { userId },
        },
        reflections: {
          select: {
            comment: true,
            favoriteCharacter: true,
            reaction: true,
            updatedAt: true,
          },
          take: 1,
          where: { userId },
        },
        season: true,
        show: {
          select: {
            id: true,
            posterPath: true,
            title: true,
          },
        },
        watches: {
          orderBy: { watchedAt: "desc" },
          take: 1,
          where: { userId },
        },
      },
      where: { id: episodeId },
    });

    return episode ? toEpisodeDetailResponse(episode) : null;
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

      if (season.episodes.length > 0) {
        const updatedAt = new Date();

        await transaction.$executeRaw(Prisma.sql`
          INSERT INTO "episodes" (
            "id",
            "show_id",
            "season_id",
            "season_number",
            "episode_number",
            "title",
            "overview",
            "still_path",
            "air_date",
            "runtime_minutes",
            "updated_at"
          )
          VALUES ${Prisma.join(season.episodes.map((episode) => Prisma.sql`(
            ${randomUUID()}::uuid,
            ${showId}::uuid,
            ${storedSeason.id}::uuid,
            ${episode.seasonNumber},
            ${episode.episodeNumber},
            ${episode.title},
            ${episode.overview},
            ${episode.stillPath},
            ${toDate(episode.airDate)},
            ${episode.runtimeMinutes},
            ${updatedAt}
          )`))}
          ON CONFLICT ("show_id", "season_number", "episode_number")
          DO UPDATE SET
            "season_id" = EXCLUDED."season_id",
            "title" = EXCLUDED."title",
            "overview" = EXCLUDED."overview",
            "still_path" = EXCLUDED."still_path",
            "air_date" = EXCLUDED."air_date",
            "runtime_minutes" = EXCLUDED."runtime_minutes",
            "updated_at" = EXCLUDED."updated_at"
        `);
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
