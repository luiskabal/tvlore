import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseCatalogResolveInput, toResolvedMovie, toResolvedShow } from "./catalog-resolve";

describe("parseCatalogResolveInput", () => {
  it("accepts a TMDB show or movie ref", () => {
    expect(parseCatalogResolveInput({
      mediaType: "show",
      provider: "tmdb",
      providerId: 70523,
    })).toEqual({
      mediaType: "show",
      provider: "tmdb",
      providerId: "70523",
    });
  });

  it("rejects malformed refs", () => {
    expect(() => parseCatalogResolveInput(null)).toThrow(BadRequestException);
    expect(() => parseCatalogResolveInput({ mediaType: "person", provider: "tmdb", providerId: "1" })).toThrow(BadRequestException);
    expect(() => parseCatalogResolveInput({ mediaType: "show", provider: "imdb", providerId: "1" })).toThrow(BadRequestException);
    expect(() => parseCatalogResolveInput({ mediaType: "show", provider: "tmdb", providerId: "0" })).toThrow(BadRequestException);
  });
});

describe("resolved TMDB detail mapping", () => {
  it("maps a TV show detail response", () => {
    expect(toResolvedShow({
      backdrop_path: "/backdrop.jpg",
      first_air_date: "2017-12-01",
      name: "Dark",
      original_name: "Dark",
      overview: "A family saga.",
      poster_path: "/poster.jpg",
    }, "70523")).toEqual({
      backdropPath: "/backdrop.jpg",
      externalRef: { provider: "tmdb", providerId: "70523" },
      firstAirDate: "2017-12-01",
      mediaType: "show",
      originalTitle: "Dark",
      overview: "A family saga.",
      posterPath: "/poster.jpg",
      releaseDate: null,
      runtimeMinutes: null,
      seasons: [],
      title: "Dark",
    });
  });

  it("maps a movie detail response", () => {
    expect(toResolvedMovie({
      release_date: "2008-07-16",
      runtime: 152,
      title: "The Dark Knight",
    }, "155")).toMatchObject({
      externalRef: { provider: "tmdb", providerId: "155" },
      mediaType: "movie",
      releaseDate: "2008-07-16",
      runtimeMinutes: 152,
      seasons: [],
      title: "The Dark Knight",
    });
  });
});
