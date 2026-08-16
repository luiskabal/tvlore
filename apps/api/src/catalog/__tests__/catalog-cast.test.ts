import { describe, expect, it } from "vitest";

import { toEpisodeCastResponse, toMovieCastResponse, toShowCastResponse } from "../catalog-cast";

describe("toMovieCastResponse", () => {
  it("maps movie cast into character choices", () => {
    expect(toMovieCastResponse({
      cast: [
        { character: "Batman", id: 1, name: "Christian Bale", order: 0, profile_path: "/bale.jpg" },
        { character: "Joker", id: 2, name: "Heath Ledger", order: 1, profile_path: "/ledger.jpg" },
      ],
    })).toEqual({
      items: [
        { actorName: "Christian Bale", characterName: "Batman", id: "1", order: 0, profilePath: "/bale.jpg" },
        { actorName: "Heath Ledger", characterName: "Joker", id: "2", order: 1, profilePath: "/ledger.jpg" },
      ],
    });
  });
});

describe("toShowCastResponse", () => {
  it("maps aggregate roles into character choices", () => {
    expect(toShowCastResponse({
      cast: [
        {
          id: 10,
          name: "Louis Hofmann",
          order: 0,
          profile_path: "/louis.jpg",
          roles: [{ character: "Jonas Kahnwald", episode_count: 26 }],
        },
      ],
    })).toEqual({
      items: [
        { actorName: "Louis Hofmann", characterName: "Jonas Kahnwald", id: "10", order: 0, profilePath: "/louis.jpg" },
      ],
    });
  });
});

describe("toEpisodeCastResponse", () => {
  it("combines episode cast and guest stars", () => {
    expect(toEpisodeCastResponse({
      credits: {
        cast: [
          { character: "Martha Nielsen", id: 20, name: "Lisa Vicari", order: 1, profile_path: "/lisa.jpg" },
        ],
        guest_stars: [
          { character: "Guest", id: 21, name: "Guest Actor", order: 2, profile_path: null },
        ],
      },
    })).toEqual({
      items: [
        { actorName: "Lisa Vicari", characterName: "Martha Nielsen", id: "20", order: 1, profilePath: "/lisa.jpg" },
        { actorName: "Guest Actor", characterName: "Guest", id: "21", order: 2, profilePath: null },
      ],
    });
  });

  it("drops malformed and duplicate cast items", () => {
    expect(toEpisodeCastResponse({
      credits: {
        cast: [
          { character: "Martha Nielsen", id: 20, name: "Lisa Vicari", order: 1 },
          { character: "Martha Nielsen", id: 20, name: "Lisa Vicari", order: 1 },
          { character: "", id: 22, name: "Unknown", order: 3 },
        ],
      },
    })).toEqual({
      items: [
        { actorName: "Lisa Vicari", characterName: "Martha Nielsen", id: "20", order: 1, profilePath: null },
      ],
    });
  });
});
