import { describe, expect, it } from "vitest";

import type { LibraryResponse, RecentlyWatchedItem, WatchedEpisodeItem } from "../api/tvlore-api";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import {
  getEpisodeSeasonKey,
  getLibraryFeedItems,
} from "./library-feed-model";
import { getDefaultSection } from "./library-overview-model";

describe("library feed model", () => {
  it("flattens watched episodes into virtualizable feed rows", () => {
    const items = getLibraryFeedItems({
      activeSection: "episodes",
      chronology: readyChronology(),
      chronologyItems: [],
      collapsedSeasonKeys: new Set(),
      isEmpty: false,
      library: libraryWithEpisodes([
        episode("episode-2", 2),
        episode("episode-1", 1),
      ]),
    });

    expect(items.map((item) => item.kind)).toEqual([
      "section-title",
      "episode-show-header",
      "episode-season-header",
      "episode",
      "episode",
    ]);
    expect(items.at(-2)).toEqual(expect.objectContaining({
      item: expect.objectContaining({ episodeNumber: 1 }),
    }));
  });

  it("keeps collapsed seasons as headers without rendering their episodes", () => {
    const items = getLibraryFeedItems({
      activeSection: "episodes",
      chronology: readyChronology(),
      chronologyItems: [],
      collapsedSeasonKeys: new Set([getEpisodeSeasonKey("show-1", 1)]),
      isEmpty: false,
      library: libraryWithEpisodes([episode("episode-1", 1)]),
    });

    expect(items.map((item) => item.kind)).toEqual([
      "section-title",
      "episode-show-header",
      "episode-season-header",
    ]);
  });

  it("adds a chronology footer when more history can be loaded", () => {
    const items = getLibraryFeedItems({
      activeSection: "chronology",
      chronology: { items: [], kind: "ready", nextCursor: "next-page" },
      chronologyItems: [episode("episode-1", 1)],
      collapsedSeasonKeys: new Set(),
      isEmpty: false,
      library: libraryWithEpisodes([]),
    });

    expect(items.at(-1)).toEqual(expect.objectContaining({
      kind: "footer",
      message: "Scroll for more history",
    }));
  });

  it("groups show episodes inside chronology by show and season", () => {
    const items = getLibraryFeedItems({
      activeSection: "chronology",
      chronology: readyChronology(),
      chronologyItems: [
        episode("episode-2", 2),
        episode("episode-1", 1),
        movie("movie-1"),
      ],
      collapsedSeasonKeys: new Set(),
      isEmpty: false,
      library: libraryWithEpisodes([]),
    });

    expect(items.map((item) => item.kind)).toEqual([
      "section-title",
      "episode-show-header",
      "episode-season-header",
      "episode",
      "episode",
      "history",
    ]);
  });

  it("opens the watchlist section first when saved titles exist", () => {
    const baseLibrary = libraryWithEpisodes([episode("episode-1", 1)]);
    const library = {
      ...baseLibrary,
      summary: {
        ...baseLibrary.summary,
        watchlistItemCount: 1,
      },
      watchlist: [{
        createdAt: "2026-08-15T00:00:00.000Z",
        id: "movie-1",
        mediaType: "movie" as const,
        posterPath: "/movie.jpg",
        title: "Saved movie",
      }],
    };

    expect(getDefaultSection(library)).toBe("watchlist");
  });
});

function readyChronology(): LibraryChronologyState {
  return {
    items: [],
    kind: "ready",
    nextCursor: null,
  };
}

function libraryWithEpisodes(watchedEpisodes: WatchedEpisodeItem[]): LibraryResponse {
  return {
    continueWatching: [],
    ratedTitles: [],
    recentlyWatched: [],
    shows: [],
    summary: {
      averageRating: null,
      ratedTitleCount: 0,
      watchedEpisodeCount: watchedEpisodes.length,
      watchedMovieCount: 0,
      watchedShowCount: watchedEpisodes.length > 0 ? 1 : 0,
      watchlistItemCount: 0,
    },
    watchlist: [],
    watchedEpisodes,
  };
}

function episode(id: string, episodeNumber: number): WatchedEpisodeItem {
  return {
    episodeNumber,
    id,
    mediaType: "episode",
    seasonNumber: 1,
    showId: "show-1",
    showPosterPath: "/show.jpg",
    showTitle: "Dark",
    stillPath: "/episode.jpg",
    title: `Episode ${episodeNumber}`,
    watchedAt: "2026-08-15T00:00:00.000Z",
  };
}

function movie(id: string): RecentlyWatchedItem {
  return {
    id,
    mediaType: "movie",
    posterPath: "/movie.jpg",
    title: "Movie",
    watchedAt: "2026-08-14T00:00:00.000Z",
  };
}
