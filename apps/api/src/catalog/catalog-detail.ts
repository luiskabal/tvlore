import { BadRequestException } from "@nestjs/common";

import type { CatalogResolvedEpisode, CatalogResolvedSeason, SeasonEpisodePageInput } from "./catalog.types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxSeasonEpisodeLimit = 50;

export type SeasonDetailQueryInput = {
  episodeLimit?: string;
  episodeOffset?: string;
  hydrate?: string;
};

export type SeasonDetailQuery = SeasonEpisodePageInput & {
  hydrate: boolean;
};

export function parseTvloreId(value: string | undefined, name: string) {
  if (!value || !uuidPattern.test(value)) {
    throwValidation(`${name} must be a valid UUID`);
  }

  return value;
}

export function parseSeasonNumber(value: string | undefined) {
  const seasonNumber = Number(value);

  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    throwValidation("seasonNumber must be a non-negative integer");
  }

  return seasonNumber;
}

export function parseSeasonDetailQuery(input: SeasonDetailQueryInput): SeasonDetailQuery {
  return {
    hydrate: parseHydrate(input.hydrate),
    limit: parseOptionalLimit(input.episodeLimit),
    offset: parseOffset(input.episodeOffset),
  };
}

export function toResolvedSeason(value: unknown): CatalogResolvedSeason | null {
  if (!isRecord(value)) {
    return null;
  }

  const seasonNumber = getNonNegativeInteger(value.season_number);

  if (seasonNumber === null) {
    return null;
  }

  const episodes = Array.isArray(value.episodes)
    ? value.episodes.map((episode) => toResolvedEpisode(episode, seasonNumber)).filter((episode): episode is CatalogResolvedEpisode => Boolean(episode))
    : [];

  return {
    airDate: getDateString(value.air_date),
    episodeCount: episodes.length,
    episodes,
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    seasonNumber,
    title: getString(value.name) ?? `Season ${seasonNumber}`,
  };
}

function toResolvedEpisode(value: unknown, seasonNumber: number): CatalogResolvedEpisode | null {
  if (!isRecord(value)) {
    return null;
  }

  const episodeNumber = getPositiveInteger(value.episode_number);

  if (episodeNumber === null) {
    return null;
  }

  return {
    airDate: getDateString(value.air_date),
    episodeNumber,
    overview: getString(value.overview) ?? "",
    runtimeMinutes: getPositiveInteger(value.runtime),
    seasonNumber,
    stillPath: getString(value.still_path),
    title: getString(value.name) ?? `Episode ${episodeNumber}`,
  };
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

function getNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function getPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function parseHydrate(value: string | undefined) {
  if (value === undefined) {
    return true;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throwValidation("hydrate must be true or false");
}

function parseOptionalLimit(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > maxSeasonEpisodeLimit) {
    throwValidation(`episodeLimit must be an integer between 1 and ${maxSeasonEpisodeLimit}`);
  }

  return limit;
}

function parseOffset(value: string | undefined) {
  if (value === undefined) {
    return 0;
  }

  const offset = Number(value);

  if (!Number.isInteger(offset) || offset < 0) {
    throwValidation("episodeOffset must be a non-negative integer");
  }

  return offset;
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
