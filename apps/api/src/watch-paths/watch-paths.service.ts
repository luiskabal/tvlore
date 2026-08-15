import { Injectable, NotFoundException } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import type { CatalogResolveResponseDto, CatalogSearchResultDto } from "../catalog/catalog.types";
import { UsersService } from "../users/users.service";
import { WatchlistRepository } from "../watchlist/watchlist.repository";
import {
  getWatchPathDefinition,
  getWatchPathItemRefKey,
  getWatchPathSummaries,
  toWatchPathDetail,
} from "./watch-paths.data";
import type { WatchPathDetailDto, WatchPathWatchlistResponseDto, WatchPathsResponseDto } from "./watch-paths.types";

const saveBatchSize = 4;

@Injectable()
export class WatchPathsService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly tmdbClient: TmdbClient,
    private readonly usersService: UsersService,
    private readonly watchlistRepository: WatchlistRepository,
  ) {}

  async list(authorizationHeader: string | undefined): Promise<WatchPathsResponseDto> {
    await this.usersService.getMe(authorizationHeader);

    return { paths: getWatchPathSummaries() };
  }

  async get(authorizationHeader: string | undefined, pathId: string | undefined): Promise<WatchPathDetailDto> {
    await this.usersService.getMe(authorizationHeader);

    if (!pathId) {
      throwNotFound();
    }

    const path = getWatchPathDefinition(pathId);

    if (!path) {
      throwNotFound();
    }

    const itemsWithIds = await this.catalogRepository.withExistingTvloreIds(path.items.map(toSearchLikeItem));
    const tvloreIdByRefKey = new Map(
      itemsWithIds
        .filter((item) => item.tvloreId)
        .map((item) => [getWatchPathItemRefKey(item), item.tvloreId as string]),
    );

    return toWatchPathDetail(path, tvloreIdByRefKey);
  }

  async saveToWatchlist(
    authorizationHeader: string | undefined,
    pathId: string | undefined,
  ): Promise<WatchPathWatchlistResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    if (!pathId) {
      throwNotFound();
    }

    const path = getWatchPathDefinition(pathId);

    if (!path) {
      throwNotFound();
    }

    const itemsWithIds = await this.catalogRepository.withExistingTvloreIds(path.items.map(toSearchLikeItem));
    const tvloreIdByRefKey = new Map(
      itemsWithIds
        .filter((item) => item.tvloreId)
        .map((item) => [getWatchPathItemRefKey(item), item.tvloreId as string]),
    );
    const savedItems = await mapInBatches(path.items, saveBatchSize, async (item) => {
      const existingId = tvloreIdByRefKey.get(getWatchPathItemRefKey(item));
      const resolved = existingId
        ? { id: existingId, mediaType: item.mediaType }
        : await this.resolvePathItem(item);

      if (resolved.mediaType === "show") {
        await this.watchlistRepository.addShow(user.id, resolved.id);
      } else {
        await this.watchlistRepository.addMovie(user.id, resolved.id);
      }

      return resolved.id;
    });

    return {
      id: path.id,
      itemCount: path.items.length,
      savedItemCount: savedItems.length,
      title: path.title,
    };
  }

  private async resolvePathItem(item: NonNullable<ReturnType<typeof getWatchPathDefinition>>["items"][number]): Promise<CatalogResolveResponseDto> {
    const resolvedItem = await this.tmdbClient.getResolvedItem({
      mediaType: item.mediaType,
      provider: item.externalRef.provider,
      providerId: item.externalRef.providerId,
    });

    return this.catalogRepository.upsertResolvedItem(resolvedItem);
  }
}

function toSearchLikeItem(item: NonNullable<ReturnType<typeof getWatchPathDefinition>>["items"][number]): CatalogSearchResultDto {
  return {
    externalRef: item.externalRef,
    mediaType: item.mediaType,
    overview: item.note ?? "",
    posterPath: item.posterPath,
    title: item.title,
    tvloreId: null,
    year: item.year,
  };
}

function throwNotFound(): never {
  throw new NotFoundException({
    code: "WATCH_PATH_NOT_FOUND",
    message: "Watch path was not found",
    details: null,
  });
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    results.push(...await Promise.all(items.slice(index, index + batchSize).map(mapper)));
  }

  return results;
}
