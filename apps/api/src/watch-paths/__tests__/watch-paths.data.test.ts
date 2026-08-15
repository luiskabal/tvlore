import { describe, expect, it } from "vitest";

import {
  getWatchPathDefinition,
  getWatchPathItemRefKey,
  getWatchPathSummaries,
  toWatchPathDetail,
} from "../watch-paths.data";

describe("watch paths data", () => {
  it("lists curated paths with item counts", () => {
    expect(getWatchPathSummaries()).toEqual([
      expect.objectContaining({
        id: "mcu-infinity-saga-release",
        itemCount: 23,
        title: "Marvel Infinity Saga",
      }),
      expect.objectContaining({
        id: "star-wars-skywalker-release",
        itemCount: 9,
        title: "Star Wars Skywalker Saga",
      }),
    ]);
  });

  it("builds ordered detail rows with hydrated tvlore IDs", () => {
    const path = getWatchPathDefinition("mcu-infinity-saga-release");

    expect(path).not.toBeNull();

    const detail = toWatchPathDetail(path!, new Map([["movie:tmdb:1726", "movie-id"]]), new Set(["movie:tmdb:1726"]));

    expect(detail.items[0]).toMatchObject({
      externalRef: { provider: "tmdb", providerId: "1726" },
      id: "mcu-infinity-saga-release-1",
      inWatchlist: true,
      posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
      position: 1,
      title: "Iron Man",
      tvloreId: "movie-id",
    });
    expect(detail.savedItemCount).toBe(1);
    expect(detail.items[1]?.inWatchlist).toBe(false);
  });

  it("uses media type and provider ref as the stable item key", () => {
    expect(getWatchPathItemRefKey({
      externalRef: { provider: "tmdb", providerId: "11" },
      mediaType: "movie",
    })).toBe("movie:tmdb:11");
  });
});
