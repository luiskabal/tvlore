import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import { TmdbClient } from "../catalog/tmdb-client";
import type { CatalogResolveResponseDto, CatalogSearchResultDto } from "../catalog/catalog.types";
import { UsersService } from "../users/users.service";
import { getCatalogKey, WatchlistRepository } from "../watchlist/watchlist.repository";
import {
  getWatchPathDefinition,
  getWatchPathItemRefKey,
  getWatchPathSummaries,
  toWatchPathDetail,
  type WatchPathDefinition,
} from "./watch-paths.data";
import { parseCreateWatchPathInput, parseImportTmdbCollectionInput } from "./watch-paths-input";
import { WatchPathsRepository } from "./watch-paths.repository";
import type {
  CreateWatchPathItemInput,
  HydratedWatchPathItemInput,
  WatchPathDetailDto,
  WatchPathWatchlistResponseDto,
  WatchPathsResponseDto,
} from "./watch-paths.types";

const saveBatchSize = 4;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

@Injectable()
export class WatchPathsService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly tmdbClient: TmdbClient,
    private readonly usersService: UsersService,
    private readonly watchlistRepository: WatchlistRepository,
    private readonly watchPathsRepository: WatchPathsRepository,
  ) {}

  async list(authorizationHeader: string | undefined): Promise<WatchPathsResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);
    const userPaths = await this.watchPathsRepository.listUserSummaries(user.id);

    return { paths: [...userPaths, ...getWatchPathSummaries()] };
  }

  async get(authorizationHeader: string | undefined, pathId: string | undefined): Promise<WatchPathDetailDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    if (!pathId) {
      throwNotFound();
    }

    const path = await this.getAccessiblePath(user.id, pathId);

    if (!path) {
      throwNotFound();
    }

    const itemsWithIds = await this.catalogRepository.withExistingTvloreIds(path.items.map(toSearchLikeItem));
    const tvloreIdByRefKey = new Map(
      itemsWithIds
        .filter((item) => item.tvloreId)
        .map((item) => [getWatchPathItemRefKey(item), item.tvloreId as string]),
    );
    const savedRefKeys = await this.getSavedRefKeys(user.id, path.items, tvloreIdByRefKey);

    return toWatchPathDetail(path, tvloreIdByRefKey, savedRefKeys);
  }

  async create(authorizationHeader: string | undefined, body: unknown): Promise<WatchPathDetailDto> {
    const input = parseCreateWatchPathInput(body);
    const user = await this.usersService.getMe(authorizationHeader);
    const hydratedItems = await mapInBatches(input.items, saveBatchSize, (item) => this.hydrateCreateItem(item));
    const path = await this.watchPathsRepository.createUserPath(user.id, {
      description: input.description,
      items: hydratedItems,
      title: input.title,
    });

    return toWatchPathDetail(path);
  }

  async importTmdbCollection(
    authorizationHeader: string | undefined,
    body: unknown,
  ): Promise<WatchPathDetailDto> {
    const input = parseImportTmdbCollectionInput(body);
    const user = await this.usersService.getMe(authorizationHeader);
    const collection = await this.tmdbClient.getMovieCollection(input.providerId);

    if (collection.items.length === 0) {
      throwValidation("TMDB collection does not contain usable movies");
    }

    const path = await this.watchPathsRepository.createUserPath(user.id, {
      description: truncateText(collection.description, 240),
      items: collection.items.slice(0, 100).map((item) => ({
        externalRef: item.externalRef,
        mediaType: item.mediaType,
        note: null,
        posterPath: item.posterPath,
        title: item.title,
        year: item.year,
      })),
      title: truncateText(collection.title, 80),
    });

    return toWatchPathDetail(path);
  }

  async saveToWatchlist(
    authorizationHeader: string | undefined,
    pathId: string | undefined,
  ): Promise<WatchPathWatchlistResponseDto> {
    const user = await this.usersService.getMe(authorizationHeader);

    if (!pathId) {
      throwNotFound();
    }

    const path = await this.getAccessiblePath(user.id, pathId);

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

  private async getAccessiblePath(userId: string, pathId: string) {
    const curatedPath = getWatchPathDefinition(pathId);

    if (curatedPath) {
      return curatedPath;
    }

    return uuidPattern.test(pathId) ? this.watchPathsRepository.findUserPath(userId, pathId) : null;
  }

  private async hydrateCreateItem(item: CreateWatchPathItemInput): Promise<HydratedWatchPathItemInput> {
    if (item.title) {
      return { ...item, title: item.title };
    }

    const resolved = await this.tmdbClient.getResolvedItem({
      mediaType: item.mediaType,
      provider: item.externalRef.provider,
      providerId: item.externalRef.providerId,
    });

    return {
      externalRef: resolved.externalRef,
      mediaType: resolved.mediaType,
      note: item.note,
      posterPath: item.posterPath ?? resolved.posterPath,
      title: resolved.title,
      year: item.year ?? getResolvedYear(resolved),
    };
  }

  private async resolvePathItem(item: WatchPathDefinition["items"][number]): Promise<CatalogResolveResponseDto> {
    const resolvedItem = await this.tmdbClient.getResolvedItem({
      mediaType: item.mediaType,
      provider: item.externalRef.provider,
      providerId: item.externalRef.providerId,
    });

    return this.catalogRepository.upsertResolvedItem(resolvedItem);
  }

  private async getSavedRefKeys(
    userId: string,
    items: WatchPathDefinition["items"],
    tvloreIdByRefKey: Map<string, string>,
  ) {
    const refs = items
      .map((item) => {
        const refKey = getWatchPathItemRefKey(item);
        const id = tvloreIdByRefKey.get(refKey);

        return id ? { id, mediaType: item.mediaType, refKey } : null;
      })
      .filter((item): item is { id: string; mediaType: "movie" | "show"; refKey: string } => Boolean(item));
    const savedCatalogKeys = await this.watchlistRepository.findSavedCatalogKeys(
      userId,
      refs.map(({ id, mediaType }) => ({ id, mediaType })),
    );

    return new Set(
      refs
        .filter((item) => savedCatalogKeys.has(getCatalogKey(item.mediaType, item.id)))
        .map((item) => item.refKey),
    );
  }
}

function toSearchLikeItem(item: WatchPathDefinition["items"][number]): CatalogSearchResultDto {
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

function getResolvedYear(item: Awaited<ReturnType<TmdbClient["getResolvedItem"]>>) {
  const date = item.mediaType === "show" ? item.firstAirDate : item.releaseDate;

  return date ? new Date(date).getFullYear() : null;
}

function throwNotFound(): never {
  throw new NotFoundException({
    code: "WATCH_PATH_NOT_FOUND",
    message: "Watch path was not found",
    details: null,
  });
}

function throwValidation(message: string): never {
  throw new BadRequestException({
    code: "VALIDATION_FAILED",
    details: null,
    message,
  });
}

function truncateText(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength).trimEnd() : value;
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
