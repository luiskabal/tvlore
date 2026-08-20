import type {
  LibraryRatedTitle,
  LibraryResponse,
  LibraryShowItem,
  LibraryWatchlistItem,
  RecentlyWatchedItem,
  WatchedEpisodeItem,
} from "../api/tvlore-api";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import {
  groupEpisodesByShowAndSeason,
  hasItemsForSection,
  type EpisodeGroup,
  type LibrarySectionFilter,
} from "./library-overview-model";

export type LibraryFeedItem =
  | { activeSection: LibrarySectionFilter; kind: "empty" }
  | { id: string; kind: "section-title"; title: string }
  | { kind: "show"; show: LibraryShowItem }
  | { item: LibraryWatchlistItem; kind: "watchlist" }
  | { item: LibraryRatedTitle; kind: "rated" }
  | { item: RecentlyWatchedItem; kind: "history" }
  | { group: EpisodeGroup; kind: "episode-show-header" }
  | {
      isCollapsed: boolean;
      kind: "episode-season-header";
      seasonKey: string;
      seasonNumber: number;
      showId: string;
      watchedCount: number;
    }
  | { item: WatchedEpisodeItem; kind: "episode" }
  | { kind: "skeleton" }
  | { id: string; kind: "status"; message: string; tone: "error" | "muted" }
  | { id: string; kind: "footer"; message: string };

type LibraryFeedOptions = {
  activeSection: LibrarySectionFilter;
  chronology: LibraryChronologyState;
  chronologyItems: RecentlyWatchedItem[];
  collapsedSeasonKeys: Set<string>;
  isEmpty: boolean;
  library: LibraryResponse;
};

export function getLibraryFeedItems({
  activeSection,
  chronology,
  chronologyItems,
  collapsedSeasonKeys,
  isEmpty,
  library,
}: LibraryFeedOptions): LibraryFeedItem[] {
  if (isEmpty) {
    return [];
  }

  if (activeSection !== "chronology" && !hasItemsForSection(activeSection, library)) {
    return [{ activeSection, kind: "empty" }];
  }

  if (activeSection === "shows") {
    return [
      { id: "shows-title", kind: "section-title", title: "Shows" },
      ...library.shows.map((show) => ({ kind: "show" as const, show })),
    ];
  }

  if (activeSection === "watchlist") {
    return [
      { id: "watchlist-title", kind: "section-title", title: "Watchlist" },
      ...library.watchlist.map((item) => ({ item, kind: "watchlist" as const })),
    ];
  }

  if (activeSection === "rated") {
    return [
      { id: "rated-title", kind: "section-title", title: "Rated" },
      ...library.ratedTitles.map((item) => ({ item, kind: "rated" as const })),
    ];
  }

  if (activeSection === "movies") {
    const movies = library.recentlyWatched.filter((item) => item.mediaType === "movie");

    return [
      { id: "movies-title", kind: "section-title", title: "Movies" },
      ...movies.map((item) => ({ item, kind: "history" as const })),
    ];
  }

  if (activeSection === "episodes") {
    return getEpisodeFeedItems(groupEpisodesByShowAndSeason(library.watchedEpisodes), collapsedSeasonKeys);
  }

  return getChronologyFeedItems(chronology, chronologyItems);
}

export function getLibraryFeedItemKey(item: LibraryFeedItem) {
  if (item.kind === "empty") {
    return `empty:${item.activeSection}`;
  }

  if (item.kind === "section-title" || item.kind === "status" || item.kind === "footer") {
    return item.id;
  }

  if (item.kind === "show") {
    return `show:${item.show.id}`;
  }

  if (item.kind === "watchlist" || item.kind === "rated") {
    return `${item.kind}:${item.item.mediaType}:${item.item.id}`;
  }

  if (item.kind === "history") {
    return `history:${item.item.mediaType}:${item.item.id}`;
  }

  if (item.kind === "episode-show-header") {
    return `episode-show:${item.group.showId}`;
  }

  if (item.kind === "episode-season-header") {
    return `episode-season:${item.seasonKey}`;
  }

  if (item.kind === "episode") {
    return `episode:${item.item.id}`;
  }

  return "skeleton";
}

export function getEpisodeSeasonKey(showId: string, seasonNumber: number) {
  return `${showId}:${seasonNumber}`;
}

function getEpisodeFeedItems(groups: EpisodeGroup[], collapsedSeasonKeys: Set<string>): LibraryFeedItem[] {
  return [
    { id: "episodes-title", kind: "section-title", title: "Episodes" },
    ...groups.flatMap((group) => [
      { group, kind: "episode-show-header" as const },
      ...group.seasons.flatMap((season) => {
        const seasonKey = getEpisodeSeasonKey(group.showId, season.seasonNumber);
        const isCollapsed = collapsedSeasonKeys.has(seasonKey);
        const header: LibraryFeedItem = {
          isCollapsed,
          kind: "episode-season-header",
          seasonKey,
          seasonNumber: season.seasonNumber,
          showId: group.showId,
          watchedCount: season.episodes.length,
        };

        return isCollapsed
          ? [header]
          : [
              header,
              ...season.episodes.map((item) => ({ item, kind: "episode" as const })),
            ];
      }),
    ]),
  ];
}

function getChronologyFeedItems(
  chronology: LibraryChronologyState,
  items: RecentlyWatchedItem[],
): LibraryFeedItem[] {
  if (chronology.kind === "loading" && items.length === 0) {
    return [{ kind: "skeleton" }];
  }

  if (items.length === 0) {
    return chronology.kind === "error"
      ? [{ id: "chronology-error", kind: "status", message: chronology.message ?? "Could not load chronology", tone: "error" }]
      : [{ activeSection: "chronology", kind: "empty" }];
  }

  return [
    { id: "chronology-title", kind: "section-title", title: "Cronologia" },
    ...(chronology.kind === "loading"
      ? [{ id: "chronology-loading", kind: "status" as const, message: "Loading full history...", tone: "muted" as const }]
      : []),
    ...(chronology.kind === "error"
      ? [{ id: "chronology-error", kind: "status" as const, message: chronology.message ?? "Could not load chronology", tone: "error" as const }]
      : []),
    ...items.map((item) => ({ item, kind: "history" as const })),
    ...(chronology.nextCursor
      ? [{
          id: "chronology-footer",
          kind: "footer" as const,
          message: chronology.kind === "loadingMore" ? "Loading more history..." : "Scroll for more history",
        }]
      : []),
  ];
}
