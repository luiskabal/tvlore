import { describe, expect, it } from "vitest";

import type { WatchPathItem } from "../api/tvlore-api";
import { getWatchPathItemKey, parseWatchPathImport, toCatalogSearchResult } from "./watch-paths-model";

describe("watch paths model", () => {
  it("builds stable item keys from provider refs", () => {
    expect(getWatchPathItemKey(item())).toBe("movie:tmdb:1726");
  });

  it("converts path items to catalog resolve input shape", () => {
    expect(toCatalogSearchResult(item())).toEqual({
      externalRef: { provider: "tmdb", providerId: "1726" },
      mediaType: "movie",
      overview: "Phase 1",
      posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
      title: "Iron Man",
      tvloreId: null,
      year: 2008,
    });
  });

  it("parses a simple TMDB import list", () => {
    expect(parseWatchPathImport("Dark list", "", "movie,155\nshow,70523,Watch after dinner")).toEqual({
      description: "Personal watch path.",
      items: [
        { externalRef: { provider: "tmdb", providerId: "155" }, mediaType: "movie", note: null },
        { externalRef: { provider: "tmdb", providerId: "70523" }, mediaType: "show", note: "Watch after dinner" },
      ],
      title: "Dark list",
    });
  });

  it("parses pasted TMDB URLs", () => {
    expect(parseWatchPathImport(
      "TMDB URL list",
      "",
      [
        "https://www.themoviedb.org/movie/155-the-dark-knight",
        "https://www.themoviedb.org/tv/70523-dark, Watch after dinner",
        "tv,1399",
      ].join("\n"),
    )).toEqual({
      description: "Personal watch path.",
      items: [
        { externalRef: { provider: "tmdb", providerId: "155" }, mediaType: "movie", note: null },
        { externalRef: { provider: "tmdb", providerId: "70523" }, mediaType: "show", note: "Watch after dinner" },
        { externalRef: { provider: "tmdb", providerId: "1399" }, mediaType: "show", note: null },
      ],
      title: "TMDB URL list",
    });
  });

  it("rejects invalid import lines", () => {
    expect(() => parseWatchPathImport("", "", "movie,155")).toThrow("Path title is required");
    expect(() => parseWatchPathImport("Bad", "", "")).toThrow("Add at least one TMDB item");
    expect(() => parseWatchPathImport("Bad", "", "book,155")).toThrow("Invalid media type");
    expect(() => parseWatchPathImport("Bad", "", "movie,0")).toThrow("Invalid TMDB id");
  });
});

function item(): WatchPathItem {
  return {
    externalRef: { provider: "tmdb", providerId: "1726" },
    id: "mcu-1",
    inWatchlist: false,
    mediaType: "movie",
    note: "Phase 1",
    posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
    position: 1,
    title: "Iron Man",
    tvloreId: null,
    year: 2008,
  };
}
