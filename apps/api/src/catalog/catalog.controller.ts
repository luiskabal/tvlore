import { Controller, Get, Headers, Query } from "@nestjs/common";

import { CatalogService } from "./catalog.service";
import type { CatalogSearchResponseDto } from "./catalog.types";

@Controller("search")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  search(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Query("query") query: string | undefined,
    @Query("types") types: string | undefined,
    @Query("page") page: string | undefined,
  ): Promise<CatalogSearchResponseDto> {
    return this.catalogService.search(authorizationHeader, query, types, page);
  }
}
