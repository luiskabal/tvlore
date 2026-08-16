import { BadRequestException } from "@nestjs/common";

import type { WatchReaction, WatchReflectionInput } from "./reflections.types";

const reactions: WatchReaction[] = ["loved", "liked", "mixed", "not_for_me"];
const maxFavoriteCharacterLength = 80;
const maxCommentLength = 500;

export function parseWatchReflectionInput(body: unknown): WatchReflectionInput {
  if (!isRecord(body)) {
    throwValidation("body must be an object");
  }

  const rating = body.rating;
  const reaction = body.reaction;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throwValidation("rating must be an integer from 1 to 5");
  }

  if (!isReaction(reaction)) {
    throwValidation(`reaction must be one of: ${reactions.join(", ")}`);
  }

  return {
    comment: parseOptionalText(body.comment, "comment", maxCommentLength),
    favoriteCharacter: parseOptionalText(body.favoriteCharacter, "favoriteCharacter", maxFavoriteCharacterLength),
    rating,
    reaction,
  };
}

function parseOptionalText(value: unknown, name: string, maxLength: number) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throwValidation(`${name} must be a string`);
  }

  const text = value.trim();

  if (!text) {
    return null;
  }

  if (text.length > maxLength) {
    throwValidation(`${name} must be ${maxLength} characters or fewer`);
  }

  return text;
}

function isReaction(value: unknown): value is WatchReaction {
  return typeof value === "string" && reactions.includes(value as WatchReaction);
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
