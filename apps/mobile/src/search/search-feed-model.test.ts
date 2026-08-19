import { describe, expect, it } from "vitest";

import type { CatalogSearchResult, RecommendationItem } from "../api/tvlore-api";
import { getSearchFeedItems } from "./search-feed-model";

describe("search feed model", () => {
  it("inserts compact recommendations between long search results", () => {
    const items = getSearchFeedItems(results(6), {
      available: [],
      personalized: [recommendation("rec-1", "The Leftovers", "show")],
      picks: [],
      popular: [],
    }, "all");

    expect(items.map((item) => item.kind)).toEqual([
      "result",
      "result",
      "result",
      "result",
      "recommendation",
      "result",
      "result",
    ]);
  });

  it("avoids recommendation duplicates by title and catalog key", () => {
    const items = getSearchFeedItems(results(6), {
      available: [],
      personalized: [recommendation("rec-1", "Result 1", "show")],
      picks: [result("show", "1", "Different Provider Copy")],
      popular: [result("movie", "popular-1", "Popular Movie")],
    }, "all");

    expect(items.filter((item) => item.kind === "recommendation")).toEqual([
      expect.objectContaining({
        recommendation: expect.objectContaining({ title: "Popular Movie" }),
      }),
    ]);
  });

  it("respects active media filters", () => {
    const items = getSearchFeedItems(results(6), {
      available: [],
      personalized: [
        recommendation("rec-show", "Recommended Show", "show"),
        recommendation("rec-movie", "Recommended Movie", "movie"),
      ],
      picks: [],
      popular: [],
    }, "movie");

    expect(items.filter((item) => item.kind === "recommendation")).toEqual([
      expect.objectContaining({
        recommendation: expect.objectContaining({ mediaType: "movie", title: "Recommended Movie" }),
      }),
    ]);
  });
});

function results(count: number) {
  return Array.from({ length: count }, (_, index) => result("show", String(index + 1), `Result ${index + 1}`));
}

function result(mediaType: "movie" | "show", providerId: string, title: string): CatalogSearchResult {
  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType,
    overview: `${title} overview`,
    posterPath: null,
    title,
    tvloreId: null,
    year: 2024,
  };
}

function recommendation(id: string, title: string, mediaType: "movie" | "show"): RecommendationItem {
  return {
    genreNames: [],
    id,
    mediaType,
    overview: `${title} overview`,
    posterPath: null,
    reason: "from_catalog",
    streamingAvailable: false,
    title,
    tvloreScore: 80,
  };
}
