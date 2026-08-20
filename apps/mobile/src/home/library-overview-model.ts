import type { LibraryResponse, RecentlyWatchedItem, WatchedEpisodeItem } from "../api/tvlore-api";
import { getHistoryActionKey, getWatchlistActionKey } from "../library/library-action-keys";

export type LibrarySectionFilter =
  | "chronology"
  | "episodes"
  | "movies"
  | "rated"
  | "shows"
  | "watchlist";

export type EpisodeGroup = {
  seasons: Array<{
    episodes: WatchedEpisodeItem[];
    seasonNumber: number;
  }>;
  showId: string;
  showTitle: string;
};

export function hasItemsForSection(activeSection: LibrarySectionFilter, library: LibraryResponse) {
  if (activeSection === "chronology") {
    return library.recentlyWatched.length > 0;
  }

  if (activeSection === "shows") {
    return library.shows.length > 0;
  }

  if (activeSection === "watchlist") {
    return library.watchlist.length > 0;
  }

  if (activeSection === "movies") {
    return library.recentlyWatched.some((item) => item.mediaType === "movie");
  }

  if (activeSection === "episodes") {
    return library.watchedEpisodes.length > 0;
  }

  if (activeSection === "rated") {
    return library.ratedTitles.length > 0;
  }

  return true;
}

export function getOptimisticLibrary(library: LibraryResponse, removedKeys: Set<string>): LibraryResponse {
  const recentlyWatched = library.recentlyWatched.filter((item) => !removedKeys.has(getHistoryActionKey(item)));
  const watchlist = library.watchlist.filter((item) => !removedKeys.has(getWatchlistActionKey(item)));
  const watchedEpisodes = library.watchedEpisodes.filter((item) => !removedKeys.has(getHistoryActionKey(item)));
  const removedRecentlyWatchedMovies = library.recentlyWatched.filter((item) => item.mediaType === "movie" && removedKeys.has(getHistoryActionKey(item)));
  const removedWatchedEpisodes = library.watchedEpisodes.filter((item) => removedKeys.has(getHistoryActionKey(item)));
  const removedWatchlistCount = library.watchlist.length - watchlist.length;

  return {
    ...library,
    recentlyWatched,
    summary: {
      ...library.summary,
      watchedEpisodeCount: Math.max(0, library.summary.watchedEpisodeCount - removedWatchedEpisodes.length),
      watchedMovieCount: Math.max(0, library.summary.watchedMovieCount - removedRecentlyWatchedMovies.length),
      watchlistItemCount: Math.max(0, library.summary.watchlistItemCount - removedWatchlistCount),
    },
    watchlist,
    watchedEpisodes,
  };
}

export function getLibraryActionKeys(library: LibraryResponse, chronologyItems: RecentlyWatchedItem[] = []) {
  return new Set([
    ...library.recentlyWatched.map(getHistoryActionKey),
    ...library.watchlist.map(getWatchlistActionKey),
    ...library.watchedEpisodes.map(getHistoryActionKey),
    ...chronologyItems.map(getHistoryActionKey),
  ]);
}

export function addSetValue<T>(values: Set<T>, value: T) {
  if (values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.add(value);
  return next;
}

export function deleteSetValue<T>(values: Set<T>, value: T) {
  if (!values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.delete(value);
  return next;
}

export function getDefaultSection(library: LibraryResponse): LibrarySectionFilter {
  return library.shows.length > 0 ? "shows" : "chronology";
}

export function groupEpisodesByShowAndSeason(
  episodes: WatchedEpisodeItem[],
): EpisodeGroup[] {
  const groups = new Map<string, EpisodeGroup>();

  episodes.forEach((episode) => {
    const showGroup = groups.get(episode.showId) ?? {
      seasons: [],
      showId: episode.showId,
      showTitle: episode.showTitle,
    };
    const seasonGroup = showGroup.seasons.find((season) => season.seasonNumber === episode.seasonNumber);

    if (seasonGroup) {
      seasonGroup.episodes.push(episode);
    } else {
      showGroup.seasons.push({ episodes: [episode], seasonNumber: episode.seasonNumber });
    }

    groups.set(episode.showId, showGroup);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    seasons: group.seasons
      .map((season) => ({
        ...season,
        episodes: [...season.episodes].sort((left, right) => left.episodeNumber - right.episodeNumber),
      }))
      .sort((left, right) => left.seasonNumber - right.seasonNumber),
  }));
}
