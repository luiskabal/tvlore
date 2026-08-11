import { BadGatewayException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";

import { API_CONFIG, type ApiConfig } from "../config";
import type { CatalogResolveInput, CatalogSearchInput } from "./catalog.types";
import { toResolvedMovie, toResolvedShow } from "./catalog-resolve";
import { toCatalogSearchResults } from "./catalog-search";

@Injectable()
export class TmdbClient {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  async search(input: CatalogSearchInput) {
    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", input.query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", String(input.page));

    return toCatalogSearchResults(await this.getJson(url), input.mediaTypes);
  }

  async getResolvedItem(input: CatalogResolveInput) {
    const path = input.mediaType === "show" ? "tv" : "movie";
    const url = new URL(`https://api.themoviedb.org/3/${path}/${input.providerId}`);
    url.searchParams.set("language", "en-US");
    const body = await this.getJson(url);
    const item = input.mediaType === "show"
      ? toResolvedShow(body, input.providerId)
      : toResolvedMovie(body, input.providerId);

    if (!item) {
      throw new BadGatewayException({
        code: "CATALOG_PROVIDER_UNAVAILABLE",
        message: "Catalog provider returned an invalid response",
        details: null,
      });
    }

    return item;
  }

  private async getJson(url: URL) {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.config.tmdbAccessToken}`,
      },
    });

    if (!response.ok) {
      throwProviderError(response.status);
    }

    try {
      return await response.json() as unknown;
    } catch {
      throw new BadGatewayException({
        code: "CATALOG_PROVIDER_UNAVAILABLE",
        message: "Catalog provider returned an invalid response",
        details: null,
      });
    }
  }
}

function throwProviderError(status: number): never {
  if (status === HttpStatus.NOT_FOUND) {
    throw new NotFoundException({
      code: "CATALOG_ITEM_NOT_FOUND",
      message: "Catalog item was not found",
      details: null,
    });
  }

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    throw new HttpException({
      code: "CATALOG_RATE_LIMITED",
      message: "Catalog provider rate limit reached",
      details: null,
    }, HttpStatus.TOO_MANY_REQUESTS);
  }

  if (status >= 500) {
    throw new ServiceUnavailableException({
      code: "CATALOG_PROVIDER_UNAVAILABLE",
      message: "Catalog provider is unavailable",
      details: null,
    });
  }

  throw new BadGatewayException({
    code: "CATALOG_PROVIDER_UNAVAILABLE",
    message: "Catalog provider request failed",
    details: null,
  });
}
