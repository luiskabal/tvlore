import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseCreateWatchPathInput, parseImportTmdbCollectionInput } from "../watch-paths-input";

describe("parseCreateWatchPathInput", () => {
  it("parses a valid watch path import", () => {
    expect(parseCreateWatchPathInput({
      description: "Release order",
      items: [
        { externalRef: { provider: "tmdb", providerId: "155" }, mediaType: "movie", note: "Start here" },
      ],
      title: "My Batman path",
    })).toEqual({
      description: "Release order",
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "155" },
          mediaType: "movie",
          note: "Start here",
          posterPath: null,
          title: null,
          year: null,
        },
      ],
      title: "My Batman path",
    });
  });

  it("rejects invalid imports", () => {
    expect(() => parseCreateWatchPathInput(null)).toThrow(BadRequestException);
    expect(() => parseCreateWatchPathInput({ items: [], title: "Empty" })).toThrow(BadRequestException);
    expect(() => parseCreateWatchPathInput({
      items: [{ externalRef: { provider: "imdb", providerId: "tt1" }, mediaType: "movie" }],
      title: "Wrong provider",
    })).toThrow(BadRequestException);
    expect(() => parseCreateWatchPathInput({
      items: [{ externalRef: { provider: "tmdb", providerId: "0" }, mediaType: "movie" }],
      title: "Wrong id",
    })).toThrow(BadRequestException);
  });

  it("parses a TMDB collection import URL", () => {
    expect(parseImportTmdbCollectionInput({
      url: "https://www.themoviedb.org/collection/10-star-wars-collection",
    })).toEqual({
      provider: "tmdb",
      providerId: "10",
      url: "https://www.themoviedb.org/collection/10-star-wars-collection",
    });
  });

  it("rejects invalid TMDB collection import URLs", () => {
    expect(() => parseImportTmdbCollectionInput(null)).toThrow(BadRequestException);
    expect(() => parseImportTmdbCollectionInput({ url: "" })).toThrow(BadRequestException);
    expect(() => parseImportTmdbCollectionInput({ url: "not-a-url" })).toThrow(BadRequestException);
    expect(() => parseImportTmdbCollectionInput({ url: "https://example.com/collection/10" })).toThrow(BadRequestException);
    expect(() => parseImportTmdbCollectionInput({ url: "https://www.themoviedb.org/movie/11-star-wars" })).toThrow(BadRequestException);
  });
});
