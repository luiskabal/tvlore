import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import type { CatalogResolveResponseDto, CatalogResolvedItem, CatalogSearchResultDto } from "./catalog.types";

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
        originalTitle: item.originalTitle,
        overview: item.overview,
        posterPath: item.posterPath,
        title: item.title,
      };

      if (existingIdentifier) {
        const show = await transaction.show.update({
          data,
          where: { id: existingIdentifier.entityId },
        });

        return { id: show.id, mediaType: "show" };
      }

      const show = await transaction.show.create({ data });
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
        originalTitle: item.originalTitle,
        overview: item.overview,
        posterPath: item.posterPath,
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
