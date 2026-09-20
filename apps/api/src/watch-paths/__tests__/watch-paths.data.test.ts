import { describe, expect, it } from "vitest";

import {
  getWatchPathDefinition,
  getWatchPathItemRefKey,
  getWatchPathSummaries,
  toWatchPathDetail,
} from "../watch-paths.data";

describe("watch paths data", () => {
  it("lists curated paths with item counts", () => {
    expect(getWatchPathSummaries()).toHaveLength(12);
    expect(getWatchPathSummaries()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "mcu-infinity-saga-release",
        itemCount: 23,
        source: "curated",
        title: "Marvel Infinity Saga",
      }),
      expect.objectContaining({
        id: "star-wars-skywalker-release",
        itemCount: 9,
        source: "curated",
        title: "Star Wars Skywalker Saga",
      }),
      expect.objectContaining({
        id: "harry-potter-release",
        itemCount: 8,
        source: "curated",
        title: "Harry Potter Saga",
      }),
      expect.objectContaining({
        id: "middle-earth-release",
        itemCount: 6,
        source: "curated",
        title: "Middle-earth Saga",
      }),
      expect.objectContaining({
        id: "hunger-games-release",
        itemCount: 5,
        source: "curated",
        title: "The Hunger Games Saga",
      }),
      expect.objectContaining({
        id: "jurassic-park-release",
        itemCount: 6,
        source: "curated",
        title: "Jurassic Saga",
      }),
      expect.objectContaining({
        id: "x-men-release",
        itemCount: 14,
        source: "curated",
        title: "X-Men Saga",
      }),
      expect.objectContaining({
        id: "terminator-release",
        itemCount: 6,
        source: "curated",
        title: "Terminator Saga",
      }),
      expect.objectContaining({
        id: "planet-apes-reboot",
        itemCount: 4,
        source: "curated",
        title: "Planet of the Apes Reboot",
      }),
      expect.objectContaining({
        id: "alien-release",
        itemCount: 7,
        source: "curated",
        title: "Alien Universe",
      }),
      expect.objectContaining({
        id: "fast-furious-story",
        itemCount: 11,
        source: "curated",
        title: "Fast & Furious Story Order",
      }),
      expect.objectContaining({
        id: "indiana-jones-release",
        itemCount: 5,
        source: "curated",
        title: "Indiana Jones Saga",
      }),
    ]));
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
    expect(detail.source).toBe("curated");
    expect(detail.savedItemCount).toBe(1);
    expect(detail.items[1]?.inWatchlist).toBe(false);
  });

  it("uses media type and provider ref as the stable item key", () => {
    expect(getWatchPathItemRefKey({
      externalRef: { provider: "tmdb", providerId: "11" },
      mediaType: "movie",
    })).toBe("movie:tmdb:11");
  });

  it.each([
    ["x-men-release", "X-Men: The Last Stand", "36668"],
    ["alien-release", "Alien 3", "8077"],
    ["alien-release", "Alien: Resurrection", "8078"],
    ["fast-furious-story", "The Fast and the Furious: Tokyo Drift", "9615"],
  ])("maps %s title %s to the expected TMDB movie", (pathId, title, providerId) => {
    const path = getWatchPathDefinition(pathId);
    const item = path?.items.find((candidate) => candidate.title === title);

    expect(item?.externalRef).toEqual({ provider: "tmdb", providerId });
  });
});
