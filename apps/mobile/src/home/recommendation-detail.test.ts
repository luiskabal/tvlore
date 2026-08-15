import { describe, expect, it } from "vitest";

import { getRecommendationDetail } from "./recommendation-detail";

describe("recommendation detail", () => {
  it("explains recommendations with the first matching preferred genre", () => {
    expect(getRecommendationDetail(
      { genreNames: ["Mystery", "Drama"], reason: "based_on_show_ratings" },
      ["Drama", "Thriller"],
    )).toBe("Because you like Drama");
  });

  it("falls back to the media rating reason when no preferred genre matches", () => {
    expect(getRecommendationDetail(
      { genreNames: ["Comedy", "Family"], reason: "based_on_movie_ratings" },
      ["Drama"],
    )).toBe("Comedy, Family - Based on your movie ratings");
  });

  it("uses the catalog reason when no rating basis exists", () => {
    expect(getRecommendationDetail(
      { genreNames: [], reason: "from_catalog" },
      [],
    )).toBe("From your TVLore catalog");
  });
});
