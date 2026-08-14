import { BadRequestException } from "@nestjs/common";

export function parseRatingInput(body: unknown): number {
  const rating = isRecord(body) ? body.rating : null;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throwValidation("rating must be an integer from 1 to 5");
  }

  return rating;
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
