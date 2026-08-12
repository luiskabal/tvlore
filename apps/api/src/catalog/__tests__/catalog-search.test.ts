import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseCatalogSearchInput, toCatalogSearchResult, toCatalogSearchResults } from "../catalog-search";

describe("parseCatalogSearchInput", () => {
  it("normalizes the search query", () => {
    expect(parseCatalogSearchInput({ query: " dark " })).toEqual({
      mediaTypes: ["show", "movie"],
      page: 1,
      query: "dark",
    });
  });

  it("validates types and page", () => {
    expect(parseCatalogSearchInput({ page: "2", query: "dark", types: "movie,show,movie" })).toEqual({
      mediaTypes: ["movie", "show"],
      page: 2,
      query: "dark",
    });

    expect(() => parseCatalogSearchInput({ query: "" })).toThrow(BadRequestException);
    expect(() => parseCatalogSearchInput({ query: "dark", types: "person" })).toThrow(BadRequestException);
    expect(() => parseCatalogSearchInput({ page: "0", query: "dark" })).toThrow(BadRequestException);
  });
});

describe("toCatalogSearchResult", () => {
  it("maps TMDB TV and movie results", () => {
    expect(toCatalogSearchResult({
      first_air_date: "2017-12-01",
      id: 70523,
      media_type: "tv",
      name: "Dark",
      overview: "A family saga.",
      poster_path: "/poster.jpg",
    })).toEqual({
      externalRef: { provider: "tmdb", providerId: "70523" },
      mediaType: "show",
      overview: "A family saga.",
      posterPath: "/poster.jpg",
      title: "Dark",
      tvloreId: null,
      year: 2017,
    });

    expect(toCatalogSearchResult({
      id: 11,
      media_type: "movie",
      release_date: "1977-05-25",
      title: "Star Wars",
    })?.mediaType).toBe("movie");
  });

  it("ignores people and malformed items", () => {
    expect(toCatalogSearchResult({ id: 1, media_type: "person", name: "Luis" })).toBeNull();
    expect(toCatalogSearchResult({ media_type: "movie", title: "Missing id" })).toBeNull();
  });
});

describe("toCatalogSearchResults", () => {
  it("filters by requested media types", () => {
    expect(toCatalogSearchResults({
      results: [
        { id: 1, media_type: "tv", name: "Dark" },
        { id: 2, media_type: "movie", title: "Dark City" },
      ],
    }, ["show"])).toHaveLength(1);
  });
});
