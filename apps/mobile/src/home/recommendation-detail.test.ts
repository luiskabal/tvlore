import { describe, expect, it } from "vitest";

import { getRecommendationDetail } from "./recommendation-detail";

describe("recommendation detail", () => {
  it("explains recommendations with the first matching preferred genre", () => {
    expect(getRecommendationDetail(
      { genreNames: ["Mystery", "Drama"], reason: "based_on_show_ratings", streamingAvailable: false, tvloreScore: 70 },
      ["Drama", "Thriller"],
    )).toBe("Because you like Drama");
  });

  it("explains TVLore house picks with genre and availability", () => {
    expect(getRecommendationDetail(
      { genreNames: ["Mystery", "Drama"], reason: "tvlore_house_pick", streamingAvailable: true, tvloreScore: 91 },
      ["Drama", "Thriller"],
    )).toBe("TVLore match: Drama and available to stream");
  });

  it("falls back to the media rating reason when no preferred genre matches", () => {
    expect(getRecommendationDetail(
      { genreNames: ["Comedy", "Family"], reason: "based_on_movie_ratings", streamingAvailable: false, tvloreScore: 51 },
      ["Drama"],
    )).toBe("Comedy, Family - Based on your movie ratings");
  });

  it("uses the catalog reason when no rating basis exists", () => {
    expect(getRecommendationDetail(
      { genreNames: [], reason: "from_catalog", streamingAvailable: false, tvloreScore: 35 },
      [],
    )).toBe("From your TVLore catalog");
  });
});
