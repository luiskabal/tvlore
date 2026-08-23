import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import {
  parseCatalogSearchInput,
  toCatalogSearchResult,
  toCatalogSearchPage,
  toCatalogSearchResults,
  toCatalogSearchResultsForMediaType,
} from "../catalog-search";

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

  it("orders search results by title relevance and provider ranking", () => {
    expect(toCatalogSearchResults({
      results: [
        {
          id: 1,
          media_type: "movie",
          popularity: 1,
          title: "Dark Low",
          vote_average: 8,
          vote_count: 100,
        },
        {
          id: 2,
          media_type: "movie",
          popularity: 50,
          title: "Dark Popular",
          vote_average: 3,
          vote_count: 5,
        },
        {
          id: 3,
          media_type: "movie",
          popularity: 0.1,
          title: "Dark",
          vote_average: 1,
          vote_count: 1,
        },
        {
          id: 4,
          media_type: "movie",
          popularity: 500,
          title: "The Dark Knight",
          vote_average: 9,
          vote_count: 10000,
        },
      ],
    }, ["movie"], "dark").map((result) => result.title)).toEqual([
      "Dark",
      "Dark Popular",
      "Dark Low",
      "The Dark Knight",
    ]);
  });

  it("maps discover results by assigning the known media type", () => {
    expect(toCatalogSearchResultsForMediaType({
      results: [
        { first_air_date: "2024-01-01", id: 1, name: "Popular Show" },
        { id: 2, name: "Missing year" },
      ],
    }, "show")).toEqual([
      expect.objectContaining({
        externalRef: { provider: "tmdb", providerId: "1" },
        mediaType: "show",
        title: "Popular Show",
        year: 2024,
      }),
      expect.objectContaining({
        externalRef: { provider: "tmdb", providerId: "2" },
        mediaType: "show",
        title: "Missing year",
        year: null,
      }),
    ]);
  });
});

describe("toCatalogSearchPage", () => {
  it("returns the next page while TMDB has more pages", () => {
    expect(toCatalogSearchPage({
      results: [
        { id: 1, media_type: "tv", name: "Dark" },
      ],
      total_pages: 3,
    }, { mediaTypes: ["show"], page: 2, query: "dark" })).toEqual({
      nextPage: 3,
      page: 2,
      results: [
        expect.objectContaining({
          externalRef: { provider: "tmdb", providerId: "1" },
          title: "Dark",
        }),
      ],
    });
  });

  it("stops pagination on the last page", () => {
    expect(toCatalogSearchPage({
      results: [],
      total_pages: 2,
    }, { mediaTypes: ["movie"], page: 2, query: "dark" }).nextPage).toBeNull();
  });
});
