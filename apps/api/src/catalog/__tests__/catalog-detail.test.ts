import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseSeasonDetailQuery, parseSeasonNumber, parseTvloreId, toResolvedSeason } from "../catalog-detail";

describe("parseTvloreId", () => {
  it("accepts UUID route ids", () => {
    expect(parseTvloreId("00000000-0000-4000-8000-000000000001", "showId")).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("rejects invalid ids", () => {
    expect(() => parseTvloreId("70523", "showId")).toThrow(BadRequestException);
  });
});

describe("parseSeasonNumber", () => {
  it("accepts season zero and positive integers", () => {
    expect(parseSeasonNumber("0")).toBe(0);
    expect(parseSeasonNumber("1")).toBe(1);
  });

  it("rejects invalid season numbers", () => {
    expect(() => parseSeasonNumber("-1")).toThrow(BadRequestException);
    expect(() => parseSeasonNumber("1.5")).toThrow(BadRequestException);
  });
});

describe("parseSeasonDetailQuery", () => {
  it("keeps backwards-compatible defaults", () => {
    expect(parseSeasonDetailQuery({})).toEqual({
      hydrate: true,
      limit: undefined,
      offset: 0,
    });
  });

  it("accepts lightweight paged reads", () => {
    expect(parseSeasonDetailQuery({
      episodeLimit: "20",
      episodeOffset: "40",
      hydrate: "false",
    })).toEqual({
      hydrate: false,
      limit: 20,
      offset: 40,
    });
  });

  it("rejects invalid season detail query params", () => {
    expect(() => parseSeasonDetailQuery({ episodeLimit: "0" })).toThrow(BadRequestException);
    expect(() => parseSeasonDetailQuery({ episodeOffset: "-1" })).toThrow(BadRequestException);
    expect(() => parseSeasonDetailQuery({ hydrate: "maybe" })).toThrow(BadRequestException);
  });
});

describe("toResolvedSeason", () => {
  it("maps TMDB season detail with episodes", () => {
    expect(toResolvedSeason({
      air_date: "2017-12-01",
      episodes: [
        {
          air_date: "2017-12-01",
          episode_number: 1,
          name: "Secrets",
          overview: "A first episode.",
          runtime: 52,
          still_path: "/still.jpg",
        },
      ],
      name: "Season 1",
      overview: "The first season.",
      poster_path: "/poster.jpg",
      season_number: 1,
    })).toEqual({
      airDate: "2017-12-01",
      episodeCount: 1,
      episodes: [
        {
          airDate: "2017-12-01",
          episodeNumber: 1,
          overview: "A first episode.",
          runtimeMinutes: 52,
          seasonNumber: 1,
          stillPath: "/still.jpg",
          title: "Secrets",
        },
      ],
      overview: "The first season.",
      posterPath: "/poster.jpg",
      seasonNumber: 1,
      title: "Season 1",
    });
  });
});
