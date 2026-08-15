import { Injectable, NotFoundException } from "@nestjs/common";

import { CatalogRepository } from "../catalog/catalog.repository";
import type { CatalogSearchResultDto } from "../catalog/catalog.types";
import { UsersService } from "../users/users.service";
import {
  getWatchPathDefinition,
  getWatchPathItemRefKey,
  getWatchPathSummaries,
  toWatchPathDetail,
} from "./watch-paths.data";
import type { WatchPathDetailDto, WatchPathsResponseDto } from "./watch-paths.types";

@Injectable()
export class WatchPathsService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly usersService: UsersService,
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
