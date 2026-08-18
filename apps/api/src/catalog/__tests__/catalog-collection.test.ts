import { describe, expect, it } from "vitest";

import { toMovieCollection } from "../catalog-collection";

describe("toMovieCollection", () => {
  it("maps TMDB collection parts into release-ordered movie search rows", () => {
    expect(toMovieCollection({
      name: "Star Wars Collection",
      overview: "A long time ago.",
      parts: [
        {
          id: 1891,
          overview: "Episode V",
          poster_path: "/empire.jpg",
          release_date: "1980-05-20",
          title: "The Empire Strikes Back",
        },
        {
          id: 11,
          overview: "Episode IV",
          poster_path: "/star-wars.jpg",
          release_date: "1977-05-25",
          title: "Star Wars",
        },
      ],
    })).toEqual({
      description: "A long time ago.",
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "11" },
          mediaType: "movie",
          overview: "Episode IV",
          posterPath: "/star-wars.jpg",
          title: "Star Wars",
          tvloreId: null,
          year: 1977,
        },
        {
          externalRef: { provider: "tmdb", providerId: "1891" },
          mediaType: "movie",
          overview: "Episode V",
          posterPath: "/empire.jpg",
          title: "The Empire Strikes Back",
          tvloreId: null,
          year: 1980,
        },
      ],
      title: "Star Wars Collection",
    });
  });

  it("rejects invalid collection responses", () => {
    expect(toMovieCollection(null)).toBeNull();
    expect(toMovieCollection({ parts: [] })).toBeNull();
  });
});
