import { describe, expect, it } from "vitest";

import type { LibraryResponse, WatchedEpisodeItem } from "../api/tvlore-api";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import {
  getEpisodeSeasonKey,
  getLibraryFeedItems,
} from "./library-feed-model";

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
