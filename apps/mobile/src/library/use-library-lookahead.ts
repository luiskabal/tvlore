import { useEffect } from "react";

import type { LibraryResponse, RecentlyWatchedItem } from "../api/tvlore-api";
import {
  prefetchCatalogDetails,
  prefetchEpisodeDetails,
  prefetchShowSeasonDetails,
} from "../catalog/prefetch";

export function useLibraryLookahead(library: LibraryResponse | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !library) {
      return;
    }

    void prefetchCatalogDetails([
      ...library.watchlist,
      ...library.ratedTitles,
      ...library.recentlyWatched.filter(isRecentlyWatchedMovie),
      ...library.watchedEpisodes.map((episode) => ({
        id: episode.showId,
        mediaType: "show" as const,
      })),
    ]);

    void prefetchShowSeasonDetails([
      ...library.continueWatching.map((show) => ({
        seasonNumber: show.nextEpisode.seasonNumber,
        showId: show.id,
      })),
      ...library.recentlyWatched.filter(isRecentlyWatchedEpisode).map((episode) => ({
        seasonNumber: episode.seasonNumber,
        showId: episode.showId,
      })),
      ...library.watchedEpisodes.map((episode) => ({
        seasonNumber: episode.seasonNumber,
        showId: episode.showId,
      })),
    ]);

    void prefetchEpisodeDetails([
      ...library.recentlyWatched.filter(isRecentlyWatchedEpisode).map((episode) => ({
        episodeId: episode.id,
      })),
      ...library.watchedEpisodes.map((episode) => ({
        episodeId: episode.id,
      })),
    ]);
  }, [enabled, library]);
}

function isRecentlyWatchedMovie(
  item: RecentlyWatchedItem,
): item is Extract<RecentlyWatchedItem, { mediaType: "movie" }> {
  return item.mediaType === "movie";
}

function isRecentlyWatchedEpisode(
  item: RecentlyWatchedItem,
): item is Extract<RecentlyWatchedItem, { mediaType: "episode" }> {
  return item.mediaType === "episode";
}
