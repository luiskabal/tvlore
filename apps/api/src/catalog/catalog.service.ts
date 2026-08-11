import { Injectable } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { parseCatalogResolveInput } from "./catalog-resolve";
import { parseCatalogSearchInput } from "./catalog-search";
import type { CatalogResolveResponseDto, CatalogSearchResponseDto } from "./catalog.types";
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
}
