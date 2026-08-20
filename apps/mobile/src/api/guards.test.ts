import { describe, expect, it } from "vitest";

import {
  isAccountDeletionStatusResponse,
  isAvailableDiscoveryResponse,
  isCatalogSearchResponse,
  isDeleteUserResponse,
  isLibraryResponse,
  isPopularDiscoveryResponse,
  isShowSeasonDetailResponse,
  isShowProgressResponse,
  isTvlorePicksDiscoveryResponse,
} from "./guards";

describe("api guards", () => {
  it("accepts account deletion responses", () => {
    expect(isDeleteUserResponse({ deleted: true })).toBe(true);
    expect(isDeleteUserResponse({ deleted: false })).toBe(false);
  });

  it("accepts account deletion readiness responses", () => {
    expect(isAccountDeletionStatusResponse({ configured: true })).toBe(true);
    expect(isAccountDeletionStatusResponse({ configured: false })).toBe(true);
    expect(isAccountDeletionStatusResponse({ configured: "false" })).toBe(false);
  });

  it("accepts completed show progress responses", () => {
    expect(isShowProgressResponse({
      isComplete: true,
      nextEpisode: null,
      percentComplete: 100,
      seasons: [
        {
          percentComplete: 100,
          seasonNumber: 1,
          totalEpisodeCount: 2,
          watchedEpisodeCount: 2,
        },
      ],
      showId: "00000000-0000-4000-8000-000000000002",
      status: "completed",
      totalEpisodeCount: 2,
      watchedEpisodeCount: 2,
    })).toBe(true);
  });

  it("accepts library responses with show library items", () => {
    expect(isLibraryResponse({
      continueWatching: [],
      ratedTitles: [],
      recentlyWatched: [
        {
          episodeNumber: 1,
          id: "00000000-0000-4000-8000-000000000003",
          mediaType: "episode",
          seasonNumber: 1,
          showId: "00000000-0000-4000-8000-000000000002",
          showPosterPath: "/dark.jpg",
          showTitle: "Dark",
          stillPath: "/secrets.jpg",
          title: "Secrets",
          watchedAt: "2026-08-14T10:00:00.000Z",
        },
      ],
      shows: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          inWatchlist: true,
          latestActivityAt: "2026-08-14T10:00:00.000Z",
          mediaType: "show",
          nextEpisode: null,
          percentComplete: 0,
          posterPath: "/dark.jpg",
          rating: 5,
          status: "not_started",
          title: "Dark",
          totalEpisodeCount: 0,
          watchedEpisodeCount: 0,
        },
      ],
      summary: {
        averageRating: 5,
        ratedTitleCount: 1,
        watchlistItemCount: 1,
        watchedEpisodeCount: 0,
        watchedMovieCount: 0,
        watchedShowCount: 0,
      },
      watchlist: [],
      watchedEpisodes: [
        {
          episodeNumber: 1,
          id: "00000000-0000-4000-8000-000000000003",
          mediaType: "episode",
          seasonNumber: 1,
          showId: "00000000-0000-4000-8000-000000000002",
          showPosterPath: "/dark.jpg",
          showTitle: "Dark",
          stillPath: "/secrets.jpg",
          title: "Secrets",
          watchedAt: "2026-08-14T10:00:00.000Z",
        },
      ],
    })).toBe(true);
  });

  it("accepts popular discovery responses with catalog search items", () => {
    expect(isPopularDiscoveryResponse({
      country: "CL",
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "70523" },
          mediaType: "show",
          overview: "Dark overview",
          posterPath: "/poster.jpg",
          title: "Dark",
          tvloreId: null,
          year: 2017,
        },
      ],
      section: "popular_in_country",
    })).toBe(true);
  });

  it("accepts paginated catalog search responses", () => {
    expect(isCatalogSearchResponse({
      nextPage: 2,
      page: 1,
      query: "dark",
      results: [
        {
          externalRef: { provider: "tmdb", providerId: "70523" },
          mediaType: "show",
          overview: "Dark overview",
          posterPath: "/poster.jpg",
          title: "Dark",
          tvloreId: null,
          year: 2017,
        },
      ],
    })).toBe(true);
  });

  it("accepts paged season detail responses", () => {
    expect(isShowSeasonDetailResponse({
      airDate: "2026-08-14",
      episodeCount: 106,
      episodePage: {
        hasMore: true,
        limit: 20,
        offset: 0,
        returnedCount: 1,
        storedCount: 106,
        totalCount: 106,
        watchedCount: 0,
      },
      episodes: [
        {
          airDate: "2026-08-14",
          episodeNumber: 1,
          id: "episode-1",
          lastWatchedAt: null,
          overview: "Special episode.",
          runtimeMinutes: 52,
          seasonNumber: 0,
          stillPath: "/still.jpg",
          title: "Special",
          watchCount: 0,
          watched: false,
        },
      ],
      id: "season-1",
      overview: "Specials.",
      posterPath: null,
      seasonNumber: 0,
      showId: "show-1",
      showTitle: "The Office",
      title: "Specials",
    })).toBe(true);
  });

  it("accepts available discovery responses with catalog search items", () => {
    expect(isAvailableDiscoveryResponse({
      country: "CL",
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "496243" },
          mediaType: "movie",
          overview: "Parasite overview",
          posterPath: "/poster.jpg",
          title: "Parasite",
          tvloreId: null,
          year: 2019,
        },
      ],
      section: "available_in_country",
    })).toBe(true);
  });

  it("rejects available discovery responses with the wrong section", () => {
    expect(isAvailableDiscoveryResponse({
      country: "CL",
      items: [],
      section: "popular_in_country",
    })).toBe(false);
  });

  it("rejects popular discovery responses with invalid result rows", () => {
    expect(isPopularDiscoveryResponse({
      country: "CL",
      items: [{ mediaType: "book", title: "Bad row" }],
      section: "popular_in_country",
    })).toBe(false);
  });

  it("accepts TVLore picks discovery responses with catalog search items", () => {
    expect(isTvlorePicksDiscoveryResponse({
      items: [
        {
          externalRef: { provider: "tmdb", providerId: "95396" },
          mediaType: "show",
          overview: "Severance overview",
          posterPath: "/poster.jpg",
          title: "Severance",
          tvloreId: null,
          year: 2022,
        },
      ],
      section: "tvlore_picks",
    })).toBe(true);
  });

  it("rejects TVLore picks with the wrong section", () => {
    expect(isTvlorePicksDiscoveryResponse({
      items: [],
      section: "popular_in_country",
    })).toBe(false);
  });
});
