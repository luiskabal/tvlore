import { describe, expect, it } from "vitest";

import type { WatchPathItem } from "../api/tvlore-api";
import { getWatchPathItemKey, toCatalogSearchResult } from "./watch-paths-model";

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
});

function item(): WatchPathItem {
  return {
    externalRef: { provider: "tmdb", providerId: "1726" },
    id: "mcu-1",
    mediaType: "movie",
    note: "Phase 1",
    posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
    position: 1,
    title: "Iron Man",
    tvloreId: null,
    year: 2008,
  };
}
