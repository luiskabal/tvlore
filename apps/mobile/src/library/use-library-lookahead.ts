import { useEffect } from "react";
import { InteractionManager } from "react-native";

import type { LibraryResponse, RecentlyWatchedItem } from "../api/tvlore-api";
import {
  prefetchCatalogDetails,
  prefetchEpisodeDetails,
  prefetchShowSeasonDetails,
} from "../catalog/prefetch";

const libraryLookaheadLimit = 2;

export function useLibraryLookahead(library: LibraryResponse | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !library) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      void prefetchCatalogDetails([
        ...library.watchlist,
        ...library.shows,
        ...library.ratedTitles,
        ...library.recentlyWatched.filter(isRecentlyWatchedMovie),
        ...library.watchedEpisodes.map((episode) => ({
          id: episode.showId,
          mediaType: "show" as const,
        })),
      ], { limit: libraryLookaheadLimit });

      void prefetchShowSeasonDetails([
        ...library.continueWatching.map((show) => ({
          seasonNumber: show.nextEpisode.seasonNumber,
          showId: show.id,
        })),
        ...library.shows
          .filter((show) => show.nextEpisode)
          .map((show) => ({
            seasonNumber: show.nextEpisode?.seasonNumber ?? 1,
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
      ], { limit: libraryLookaheadLimit });

      void prefetchEpisodeDetails([
        ...library.recentlyWatched.filter(isRecentlyWatchedEpisode).map((episode) => ({
          episodeId: episode.id,
        })),
        ...library.watchedEpisodes.map((episode) => ({
          episodeId: episode.id,
        })),
      ], { limit: libraryLookaheadLimit });
    });

    return () => task.cancel();
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
