import { describe, expect, it } from "vitest";

import { getUniqueCatalogDetailRefs, getUniqueShowSeasonRefs } from "./prefetch-model";

describe("catalog prefetch", () => {
  it("keeps first unique catalog refs inside the lookahead limit", () => {
    expect(getUniqueCatalogDetailRefs([
      { id: "show-1", mediaType: "show" },
      { id: "show-1", mediaType: "show" },
      { id: null, mediaType: "movie" },
      { id: "movie-1", mediaType: "movie" },
      { id: "movie-2", mediaType: "movie" },
    ], 2)).toEqual([
      { id: "show-1", mediaType: "show" },
      { id: "movie-1", mediaType: "movie" },
    ]);
  });

  it("keeps first unique show season refs inside the lookahead limit", () => {
    expect(getUniqueShowSeasonRefs([
      { seasonNumber: 1, showId: "show-1" },
      { seasonNumber: 1, showId: "show-1" },
      { seasonNumber: null, showId: "show-2" },
      { seasonNumber: 2, showId: "show-1" },
      { seasonNumber: 1, showId: "show-3" },
    ], 2)).toEqual([
      { seasonNumber: 1, showId: "show-1" },
      { seasonNumber: 2, showId: "show-1" },
    ]);
  });
});
