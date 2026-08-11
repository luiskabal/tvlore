import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";

import { CatalogService } from "./catalog.service";
import type { CatalogResolveResponseDto, CatalogSearchResponseDto } from "./catalog.types";

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

@Controller("catalog")
export class CatalogResolveController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post("resolve")
  @HttpCode(HttpStatus.OK)
  resolve(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body() body: unknown,
  ): Promise<CatalogResolveResponseDto> {
    return this.catalogService.resolve(authorizationHeader, body);
  }
}
