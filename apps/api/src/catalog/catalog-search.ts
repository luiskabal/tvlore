import { BadRequestException } from "@nestjs/common";

import type { CatalogSearchInput, CatalogSearchResponseDto, CatalogSearchResultDto, MediaType } from "./catalog.types";

const defaultMediaTypes: MediaType[] = ["show", "movie"];
const maxQueryLength = 100;
const maxPage = 500;

export function parseCatalogSearchInput(input: {
  page?: string;
  query?: string;
  types?: string;
}): CatalogSearchInput {
  const query = input.query?.trim();

  if (!query) {
    throwValidation("query is required");
  }

  if (query.length > maxQueryLength) {
    throwValidation(`query must be ${maxQueryLength} characters or fewer`);
  }

  return {
    mediaTypes: parseMediaTypes(input.types),
    page: parsePage(input.page),
    query,
  };
}

export function toCatalogSearchResult(value: unknown): CatalogSearchResultDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const mediaType = getMediaType(value.media_type);

  if (!mediaType) {
    return null;
  }

  const providerId = getProviderId(value.id);
  const title = mediaType === "movie" ? getString(value.title) : getString(value.name);

  if (!providerId || !title) {
    return null;
  }

  const date = mediaType === "movie" ? getString(value.release_date) : getString(value.first_air_date);

  return {
    externalRef: {
      provider: "tmdb",
      providerId,
    },
    mediaType,
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    title,
    tvloreId: null,
    year: getYear(date),
  };
}

export function toCatalogSearchResults(value: unknown, mediaTypes: MediaType[]) {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return [];
  }

  return value.results
    .map(toCatalogSearchResult)
    .filter((result): result is CatalogSearchResultDto => Boolean(result))
    .filter((result) => mediaTypes.includes(result.mediaType));
}

export function toCatalogSearchPage(
  value: unknown,
  input: CatalogSearchInput,
): Pick<CatalogSearchResponseDto, "nextPage" | "page" | "results"> {
  const totalPages = isRecord(value) && typeof value.total_pages === "number"
    ? Math.min(Math.floor(value.total_pages), maxPage)
    : input.page;

  return {
    nextPage: input.page < totalPages ? input.page + 1 : null,
    page: input.page,
    results: toCatalogSearchResults(value, input.mediaTypes),
  };
}

export function toCatalogSearchResultsForMediaType(value: unknown, mediaType: MediaType) {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return [];
  }

  const providerMediaType = mediaType === "show" ? "tv" : "movie";

  return value.results
    .map((result) => isRecord(result) ? { ...result, media_type: providerMediaType } : result)
    .map(toCatalogSearchResult)
    .filter((result): result is CatalogSearchResultDto => Boolean(result));
}

function parseMediaTypes(value: string | undefined): MediaType[] {
  if (!value?.trim()) {
    return defaultMediaTypes;
  }

  const mediaTypes = value.split(",").map((part) => part.trim()).filter(Boolean);

  if (mediaTypes.length === 0 || mediaTypes.some((mediaType) => mediaType !== "show" && mediaType !== "movie")) {
    throwValidation("types must be show, movie, or show,movie");
  }

  return [...new Set(mediaTypes)] as MediaType[];
}

function parsePage(value: string | undefined) {
  if (!value) {
    return 1;
  }

  const page = Number(value);

  if (!Number.isInteger(page) || page < 1 || page > maxPage) {
    throwValidation(`page must be an integer between 1 and ${maxPage}`);
  }

  return page;
}

function getMediaType(value: unknown): MediaType | null {
  if (value === "movie") {
    return "movie";
  }

  if (value === "tv") {
    return "show";
  }

  return null;
}

function getProviderId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getYear(value: string | null) {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));

  return Number.isInteger(year) ? year : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function throwValidation(message: string): never {
  throw new BadRequestException({
    code: "VALIDATION_FAILED",
    message,
    details: null,
  });
}
