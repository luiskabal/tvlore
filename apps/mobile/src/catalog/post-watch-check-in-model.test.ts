import { describe, expect, it } from "vitest";

import { createCheckInDraft, normalizeCheckInDraft } from "./post-watch-check-in-model";

describe("post-watch check-in model", () => {
  it("creates a default draft when no reflection exists", () => {
    expect(createCheckInDraft(null, null)).toEqual({
      comment: null,
      favoriteCharacter: null,
      rating: 5,
      reaction: "liked",
    });
  });

  it("uses existing rating and reflection values", () => {
    expect(createCheckInDraft(4, {
      comment: "Great",
      favoriteCharacter: "Jonas",
      reaction: "loved",
      updatedAt: "2026-08-14T00:00:00.000Z",
    })).toEqual({
      comment: "Great",
      favoriteCharacter: "Jonas",
      rating: 4,
      reaction: "loved",
    });
  });

  it("normalizes optional text fields", () => {
    expect(normalizeCheckInDraft({
      comment: "  ",
      favoriteCharacter: "  Martha  ",
      rating: 3,
      reaction: "mixed",
    })).toEqual({
      comment: null,
      favoriteCharacter: "Martha",
      rating: 3,
      reaction: "mixed",
    });
  });
});
