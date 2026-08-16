import { BadRequestException } from "@nestjs/common";

import type { CatalogResolveInput, CatalogResolvedItem, CatalogResolvedSeasonSummary } from "./catalog.types";

export function parseCatalogResolveInput(value: unknown): CatalogResolveInput {
  if (!isRecord(value)) {
    throwValidation("request body is required");
  }

  if (value.mediaType !== "show" && value.mediaType !== "movie") {
    throwValidation("mediaType must be show or movie");
  }

  if (value.provider !== "tmdb") {
    throwValidation("provider must be tmdb");
  }

  const providerId = getTmdbProviderId(value.providerId);

  if (!providerId) {
    throwValidation("providerId must be a positive TMDB id");
  }

  return {
    mediaType: value.mediaType,
    provider: "tmdb",
    providerId,
  };
}

export function toResolvedShow(value: unknown, providerId: string): CatalogResolvedItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = getString(value.name);

  if (!title) {
    return null;
  }

  return {
    backdropPath: getString(value.backdrop_path),
    externalRef: { provider: "tmdb", providerId },
    firstAirDate: getDateString(value.first_air_date),
    genreNames: getGenreNames(value.genres),
    mediaType: "show",
    originalTitle: getString(value.original_name),
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    publicRating: getPublicRating(value.vote_average),
    releaseDate: null,
    runtimeMinutes: null,
    seasons: getResolvedSeasonSummaries(value.seasons),
    title,
  };
}

export function toResolvedMovie(value: unknown, providerId: string): CatalogResolvedItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = getString(value.title);

  if (!title) {
    return null;
  }

  return {
    backdropPath: getString(value.backdrop_path),
    externalRef: { provider: "tmdb", providerId },
    firstAirDate: null,
    genreNames: getGenreNames(value.genres),
    mediaType: "movie",
    originalTitle: getString(value.original_title),
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    publicRating: getPublicRating(value.vote_average),
    releaseDate: getDateString(value.release_date),
    runtimeMinutes: getPositiveInteger(value.runtime),
    seasons: [],
    title,
  };
}

function getGenreNames(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((genre) => isRecord(genre) ? getString(genre.name) : null)
    .filter((name): name is string => Boolean(name));
}

function getResolvedSeasonSummaries(value: unknown): CatalogResolvedSeasonSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toResolvedSeasonSummary).filter((season): season is CatalogResolvedSeasonSummary => Boolean(season));
}

function toResolvedSeasonSummary(value: unknown): CatalogResolvedSeasonSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const seasonNumber = getNonNegativeInteger(value.season_number);

  if (seasonNumber === null) {
    return null;
  }

  return {
    airDate: getDateString(value.air_date),
    episodeCount: getNonNegativeInteger(value.episode_count) ?? 0,
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    seasonNumber,
    title: getString(value.name) ?? `Season ${seasonNumber}`,
  };
}

function getTmdbProviderId(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const providerId = String(value).trim();

  return /^[1-9]\d*$/.test(providerId) ? providerId : null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getDateString(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  return value;
}

function getPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function getPublicRating(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10 ? value : null;
}

function getNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
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
