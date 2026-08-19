import { describe, expect, it } from "vitest";

import type { RecentlyWatchedItem } from "../api/tvlore-api";
import { getChronologyItemKey, mergeChronologyItems } from "./chronology-items";

describe("chronology items", () => {
  it("keeps movie and episode entries distinct even when ids match", () => {
    const movie = movieItem("same-id", "Dark");
    const episode = episodeItem("same-id", "Secrets");

    expect(getChronologyItemKey(movie)).toBe("movie:same-id");
    expect(getChronologyItemKey(episode)).toBe("episode:same-id");
  });

  it("merges later pages without duplicating items already loaded", () => {
    const current = [movieItem("movie-1", "The Dark Knight"), episodeItem("episode-1", "Secrets")];
    const next = [episodeItem("episode-1", "Secrets"), movieItem("movie-2", "Dark City")];

    expect(mergeChronologyItems(current, next)).toEqual([
      current[0],
      current[1],
      next[1],
    ]);
  });
});

function movieItem(id: string, title: string): RecentlyWatchedItem {
  return {
    id,
    mediaType: "movie",
    posterPath: null,
    title,
    watchedAt: "2026-08-15T00:00:00.000Z",
  };
}

function episodeItem(id: string, title: string): RecentlyWatchedItem {
  return {
    episodeNumber: 1,
    id,
    mediaType: "episode",
    seasonNumber: 1,
    showId: "show-1",
    showPosterPath: "/dark.jpg",
    showTitle: "Dark",
    stillPath: "/secrets.jpg",
    title,
    watchedAt: "2026-08-15T00:00:00.000Z",
  };
}
