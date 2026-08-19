import { BadGatewayException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";

import { API_CONFIG, type ApiConfig } from "../config";
import type { CatalogResolveInput, CatalogSearchInput, MediaType } from "./catalog.types";
import { toEpisodeCastResponse, toMovieCastResponse, toShowCastResponse } from "./catalog-cast";
import { toMovieCollection } from "./catalog-collection";
import { toResolvedSeason } from "./catalog-detail";
import { toResolvedMovie, toResolvedShow } from "./catalog-resolve";
import { toCatalogSearchPage, toCatalogSearchResultsForMediaType } from "./catalog-search";
import { toWatchProvidersResponse } from "./catalog-watch-providers";

@Injectable()
export class TmdbClient {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  async getPopularByCountry(country: string) {
    const [shows, movies] = await Promise.all([
      this.getDiscoverResults("show", country, { sortBy: "popularity.desc" }),
      this.getDiscoverResults("movie", country, { sortBy: "popularity.desc" }),
    ]);

    return interleave(shows.slice(0, 6), movies.slice(0, 6)).slice(0, 12);
  }

  async getAvailableByCountry(country: string) {
    const [shows, movies] = await Promise.all([
      this.getDiscoverResults("show", country, { sortBy: "vote_average.desc", voteCountGte: 200 }),
      this.getDiscoverResults("movie", country, { sortBy: "vote_average.desc", voteCountGte: 200 }),
    ]);

    return interleave(shows.slice(0, 6), movies.slice(0, 6)).slice(0, 12);
  }

  async search(input: CatalogSearchInput) {
    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", input.query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", String(input.page));

    return toCatalogSearchPage(await this.getJson(url), input);
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

  async getResolvedSeason(providerShowId: string, seasonNumber: number) {
    const url = new URL(`https://api.themoviedb.org/3/tv/${providerShowId}/season/${seasonNumber}`);
    url.searchParams.set("language", "en-US");
    const season = toResolvedSeason(await this.getJson(url));

    if (!season) {
      throw new BadGatewayException({
        code: "CATALOG_PROVIDER_UNAVAILABLE",
        message: "Catalog provider returned an invalid response",
        details: null,
      });
    }

    return season;
  }

  async getWatchProviders(mediaType: MediaType, providerId: string, country: string) {
    const path = mediaType === "show" ? "tv" : "movie";
    const url = new URL(`https://api.themoviedb.org/3/${path}/${providerId}/watch/providers`);

    return toWatchProvidersResponse(await this.getJson(url), country);
  }

  async getMovieCollection(providerId: string) {
    const url = new URL(`https://api.themoviedb.org/3/collection/${providerId}`);
    url.searchParams.set("language", "en-US");
    const collection = toMovieCollection(await this.getJson(url));

    if (!collection) {
      throw new BadGatewayException({
        code: "CATALOG_PROVIDER_UNAVAILABLE",
        message: "Catalog provider returned an invalid collection response",
        details: null,
      });
    }

    return collection;
  }

  private async getDiscoverResults(
    mediaType: MediaType,
    country: string,
    options: { sortBy: string; voteCountGte?: number },
  ) {
    const path = mediaType === "show" ? "tv" : "movie";
    const url = new URL(`https://api.themoviedb.org/3/discover/${path}`);

    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");
    url.searchParams.set("sort_by", options.sortBy);
    url.searchParams.set("watch_region", country);
    url.searchParams.set("with_watch_monetization_types", "flatrate|free|ads");

    if (options.voteCountGte) {
      url.searchParams.set("vote_count.gte", String(options.voteCountGte));
    }

    if (mediaType === "movie") {
      url.searchParams.set("include_video", "false");
    }

    return toCatalogSearchResultsForMediaType(await this.getJson(url), mediaType);
  }

  async getMovieCast(providerId: string) {
    const url = new URL(`https://api.themoviedb.org/3/movie/${providerId}/credits`);
    url.searchParams.set("language", "en-US");

    return toMovieCastResponse(await this.getJson(url));
  }

  async getShowCast(providerId: string) {
    const url = new URL(`https://api.themoviedb.org/3/tv/${providerId}/aggregate_credits`);
    url.searchParams.set("language", "en-US");

    return toShowCastResponse(await this.getJson(url));
  }

  async getEpisodeCast(providerShowId: string, seasonNumber: number, episodeNumber: number) {
    const url = new URL(`https://api.themoviedb.org/3/tv/${providerShowId}/season/${seasonNumber}/episode/${episodeNumber}`);
    url.searchParams.set("append_to_response", "credits");
    url.searchParams.set("language", "en-US");

    return toEpisodeCastResponse(await this.getJson(url));
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

function interleave<T>(left: T[], right: T[]) {
  const items: T[] = [];
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    if (left[index]) {
      items.push(left[index]);
    }

    if (right[index]) {
      items.push(right[index]);
    }
  }

  return items;
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
