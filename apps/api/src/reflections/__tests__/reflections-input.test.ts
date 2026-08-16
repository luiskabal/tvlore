import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseWatchReflectionInput } from "../reflections-input";

describe("parseWatchReflectionInput", () => {
  it("parses rating, reaction, favorite character and comment", () => {
    expect(parseWatchReflectionInput({
      comment: "  Great finale.  ",
      favoriteCharacter: "  Jonas  ",
      rating: 5,
      reaction: "loved",
    })).toEqual({
      comment: "Great finale.",
      favoriteCharacter: "Jonas",
      rating: 5,
      reaction: "loved",
    });
  });

  it("normalizes empty optional text", () => {
    expect(parseWatchReflectionInput({
      comment: "",
      favoriteCharacter: "   ",
      rating: 3,
      reaction: "mixed",
    })).toEqual({
      comment: null,
      favoriteCharacter: null,
      rating: 3,
      reaction: "mixed",
    });
  });

  it("rejects invalid reflection input", () => {
    expect(() => parseWatchReflectionInput(null)).toThrow(BadRequestException);
    expect(() => parseWatchReflectionInput({ rating: 6, reaction: "liked" })).toThrow(BadRequestException);
    expect(() => parseWatchReflectionInput({ rating: 4, reaction: "wow" })).toThrow(BadRequestException);
    expect(() => parseWatchReflectionInput({ favoriteCharacter: 12, rating: 4, reaction: "liked" })).toThrow(BadRequestException);
    expect(() => parseWatchReflectionInput({
      comment: "x".repeat(501),
      rating: 4,
      reaction: "liked",
    })).toThrow(BadRequestException);
  });
});
