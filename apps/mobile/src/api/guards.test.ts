import { describe, expect, it } from "vitest";

import { isPopularDiscoveryResponse } from "./guards";

describe("api guards", () => {
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
});
