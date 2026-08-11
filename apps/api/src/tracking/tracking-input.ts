import { BadRequestException } from "@nestjs/common";

import type { WatchInput } from "./tracking.types";

const isoDatetimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export function parseWatchInput(body: unknown): WatchInput {
  if (body === undefined || body === null || isEmptyRecord(body)) {
    return { watchedAt: new Date() };
  }

  if (!isRecord(body) || !("watchedAt" in body)) {
    throwValidation("watchedAt must be an ISO datetime when provided");
  }

  if (typeof body.watchedAt !== "string" || !isoDatetimePattern.test(body.watchedAt)) {
    throwValidation("watchedAt must be an ISO datetime when provided");
  }

  const watchedAt = new Date(body.watchedAt);

  if (Number.isNaN(watchedAt.getTime())) {
    throwValidation("watchedAt must be an ISO datetime when provided");
  }

  return { watchedAt };
}

function isEmptyRecord(value: unknown) {
  return isRecord(value) && Object.keys(value).length === 0;
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
