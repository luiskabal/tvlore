import { BadRequestException } from "@nestjs/common";

import type { CreateWatchPathInput, CreateWatchPathItemInput } from "./watch-paths.types";

const maxItems = 100;

export function parseCreateWatchPathInput(value: unknown): CreateWatchPathInput {
  if (!isRecord(value)) {
    throwValidation("request body is required");
  }

  const title = parseRequiredText(value.title, "title", 80);
  const description = parseOptionalText(value.description, "description", 240) ?? "Personal watch path.";

  if (!Array.isArray(value.items) || value.items.length === 0) {
    throwValidation("items are required");
  }

  if (value.items.length > maxItems) {
    throwValidation(`items cannot contain more than ${maxItems} entries`);
  }

  return {
    description,
    items: value.items.map(parseItem),
    title,
  };
}

function parseItem(value: unknown): CreateWatchPathItemInput {
  if (!isRecord(value) || !isRecord(value.externalRef)) {
    throwValidation("each item requires an externalRef");
  }

  const mediaType = value.mediaType === "movie" || value.mediaType === "show" ? value.mediaType : null;

  if (!mediaType) {
    throwValidation("item mediaType must be movie or show");
  }

  if (value.externalRef.provider !== "tmdb") {
    throwValidation("item provider must be tmdb");
  }

  const providerId = parseProviderId(value.externalRef.providerId);
  const title = parseOptionalText(value.title, "item title", 120);

  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType,
    note: parseOptionalText(value.note, "item note", 120),
    posterPath: parsePosterPath(value.posterPath),
    title,
    year: parseYear(value.year),
  };
}

function parseRequiredText(value: unknown, label: string, maxLength: number) {
  const text = parseOptionalText(value, label, maxLength);

  if (!text) {
    throwValidation(`${label} is required`);
  }

  return text;
}

function parseOptionalText(value: unknown, label: string, maxLength: number) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throwValidation(`${label} must be a string`);
  }

  const text = value.trim();

  if (!text) {
    return null;
  }

  if (text.length > maxLength) {
    throwValidation(`${label} is too long`);
  }

  return text;
}

function parseProviderId(value: unknown) {
  if (typeof value !== "string") {
    throwValidation("item providerId must be a string");
  }

  const providerId = value.trim();

  if (!/^[1-9]\d{0,11}$/.test(providerId)) {
    throwValidation("item providerId must be a positive TMDB id");
  }

  return providerId;
}

function parsePosterPath(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throwValidation("item posterPath must be a string");
  }

  const posterPath = value.trim();

  if (!posterPath) {
    return null;
  }

  if (!posterPath.startsWith("/") || posterPath.length > 120) {
    throwValidation("item posterPath must be a TMDB poster path");
  }

  return posterPath;
}

function parseYear(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1870 || value > 2100) {
    throwValidation("item year must be a valid year");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function throwValidation(message: string): never {
  throw new BadRequestException({
    code: "VALIDATION_FAILED",
    details: null,
    message,
  });
}
