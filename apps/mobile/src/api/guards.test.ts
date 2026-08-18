import { describe, expect, it } from "vitest";

import { isDeleteUserResponse, isPopularDiscoveryResponse, isTvlorePicksDiscoveryResponse } from "./guards";

describe("api guards", () => {
  it("accepts account deletion responses", () => {
    expect(isDeleteUserResponse({ deleted: true })).toBe(true);
    expect(isDeleteUserResponse({ deleted: false })).toBe(false);
  });

  it("accepts popular discovery responses with catalog search items", () => {
    expect(isPopularDiscoveryResponse({
      country: "CL",
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "70523" },
          mediaType: "show",
          overview: "Dark overview",
          posterPath: "/poster.jpg",
          title: "Dark",
          tvloreId: null,
          year: 2017,
        },
      ],
      section: "popular_in_country",
    })).toBe(true);
  });

  it("rejects popular discovery responses with invalid result rows", () => {
    expect(isPopularDiscoveryResponse({
      country: "CL",
      items: [{ mediaType: "book", title: "Bad row" }],
      section: "popular_in_country",
    })).toBe(false);
  });

  it("accepts TVLore picks discovery responses with catalog search items", () => {
    expect(isTvlorePicksDiscoveryResponse({
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "95396" },
          mediaType: "show",
          overview: "Severance overview",
          posterPath: "/poster.jpg",
          title: "Severance",
          tvloreId: null,
          year: 2022,
        },
      ],
      section: "tvlore_picks",
    })).toBe(true);
  });

  it("rejects TVLore picks with the wrong section", () => {
    expect(isTvlorePicksDiscoveryResponse({
      items: [],
      section: "popular_in_country",
    })).toBe(false);
  });
});
