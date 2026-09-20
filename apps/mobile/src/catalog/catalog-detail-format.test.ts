import { describe, expect, it } from "vitest";

import type { ShowDetailResponse } from "../api/tvlore-api";
import { updateCatalogDetailRating } from "./catalog-detail-rating";
import { getOptimisticShowProgress } from "./catalog-detail-format";

describe("catalog detail formatting", () => {
  it("marks every known season complete before a show watch sync finishes", () => {
    const show: ShowDetailResponse = {
      backdropPath: null,
      firstAirDate: null,
      genreNames: ["Drama"],
      id: "show-1",
      inWatchlist: false,
      mediaType: "show",
      originalTitle: null,
      overview: "",
      posterPath: null,
      progress: {
        isComplete: false,
        nextEpisode: null,
        percentComplete: 0,
        seasons: [],
        showId: "show-1",
        status: "not_started",
        totalEpisodeCount: 0,
        watchedEpisodeCount: 0,
      },
      publicRating: null,
      rating: null,
      reflection: null,
      seasons: [
        { airDate: null, episodeCount: 3, id: "season-1", overview: "", posterPath: null, seasonNumber: 1, title: "Season 1" },
        { airDate: null, episodeCount: 2, id: "season-2", overview: "", posterPath: null, seasonNumber: 2, title: "Season 2" },
      ],
      title: "Show",
    };

    expect(getOptimisticShowProgress(show, true)).toMatchObject({
      isComplete: true,
      percentComplete: 100,
      totalEpisodeCount: 5,
      watchedEpisodeCount: 5,
      seasons: [
        { percentComplete: 100, seasonNumber: 1, totalEpisodeCount: 3, watchedEpisodeCount: 3 },
        { percentComplete: 100, seasonNumber: 2, totalEpisodeCount: 2, watchedEpisodeCount: 2 },
      ],
      status: "completed",
    });
  });

  it("updates the visible rating for a newly rated catalog title", () => {
    const movie = {
      backdropPath: null,
      genreNames: ["Drama"],
      id: "movie-1",
      inWatchlist: false,
      lastWatchedAt: null,
      mediaType: "movie" as const,
      originalTitle: null,
      overview: "",
      posterPath: null,
      publicRating: null,
      rating: null,
      reflection: null,
      releaseDate: null,
      runtimeMinutes: null,
      title: "Movie",
      watchCount: 0,
      watched: false,
    };

    expect(updateCatalogDetailRating(movie, "movie", "movie-1", 4).rating).toBe(4);
  });
});
