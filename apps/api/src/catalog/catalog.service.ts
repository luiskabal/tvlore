import { Injectable } from "@nestjs/common";

import { UsersService } from "../users/users.service";
import { parseCatalogSearchInput } from "./catalog-search";
import type { CatalogSearchResponseDto } from "./catalog.types";
import { TmdbClient } from "./tmdb-client";

@Injectable()
export class CatalogService {
  constructor(
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
      results,
    };
  }
}
