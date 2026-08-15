import { describe, expect, it } from "vitest";

import type { CatalogSearchResult } from "../api/tvlore-api";
import { canRunSearch, getMediaTypes, getResultKey } from "./search-model";

describe("search model", () => {
  it("maps the all filter to both supported catalog media types", () => {
    expect(getMediaTypes("all")).toEqual(["show", "movie"]);
  });

  it("maps single media filters to one media type", () => {
    expect(getMediaTypes("show")).toEqual(["show"]);
    expect(getMediaTypes("movie")).toEqual(["movie"]);
  });

  it("uses trimmed query length to decide if search can run", () => {
    expect(canRunSearch(" da ")).toBe(false);
    expect(canRunSearch(" dark ")).toBe(true);
  });

  it("builds stable result keys from media type and provider ref", () => {
    const result = {
      externalRef: { provider: "tmdb", providerId: "70523" },
      mediaType: "show",
    } satisfies Pick<CatalogSearchResult, "externalRef" | "mediaType">;

    expect(getResultKey(result)).toBe("show-tmdb-70523");
  });
});
