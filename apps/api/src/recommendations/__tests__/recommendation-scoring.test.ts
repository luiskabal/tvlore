import { describe, expect, it } from "vitest";

import { rankTvloreRecommendations } from "../recommendation-scoring";
import type { RecommendationBasisDto } from "../recommendations.types";

const basis: RecommendationBasisDto = {
  averageMovieRating: 4.8,
  averageShowRating: 3.6,
  availabilityCountry: "CL",
  preferredGenreNames: ["Drama", "Sci-Fi"],
  ratedTitleCount: 4,
};

describe("rankTvloreRecommendations", () => {
  it("scores genre, media affinity, rating strength, and streaming availability", () => {
    expect(rankTvloreRecommendations([
      candidate("show-1", "show", ["Drama"], true, 0),
      candidate("movie-1", "movie", ["Comedy"], false, 1),
      candidate("movie-2", "movie", ["Drama", "Sci-Fi"], true, 2),
    ], basis)).toMatchObject([
      {
        id: "movie-2",
        reason: "tvlore_house_pick",
        streamingAvailable: true,
        tvloreScore: 100,
      },
      {
        id: "show-1",
        reason: "tvlore_house_pick",
        streamingAvailable: true,
        tvloreScore: 77,
      },
      {
        id: "movie-1",
        reason: "based_on_movie_ratings",
        streamingAvailable: false,
        tvloreScore: 59,
      },
    ]);
  });

  it("uses availability as the reason when there is no genre match", () => {
    expect(rankTvloreRecommendations([
      candidate("movie-1", "movie", ["Comedy"], true, 0),
    ], basis)[0]).toMatchObject({
      id: "movie-1",
      reason: "available_in_country",
    });
  });
});

function candidate(
  id: string,
  mediaType: "movie" | "show",
  genreNames: string[],
  streamingAvailable: boolean,
  originalRank: number,
) {
  return {
    genreNames,
    id,
    mediaType,
    originalRank,
    overview: `${id} overview`,
    posterPath: null,
    reason: mediaType === "movie" ? "based_on_movie_ratings" : "based_on_show_ratings",
    streamingAvailable,
    title: id,
  } as const;
}
