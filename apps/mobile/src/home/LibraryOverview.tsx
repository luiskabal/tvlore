import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

import type {
  LibraryResponse,
  LibraryWatchlistItem,
  RecentlyWatchedItem,
} from "../api/tvlore-api";
import {
  getHistoryActionKey,
  type LibraryActionState,
} from "../library/use-library-actions";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import { Skeleton, StatCard } from "../ui";
import { styles } from "./home-styles";
import {
  ChronologySection,
  EmptySection,
  EpisodesSection,
  MoviesSection,
  RatedSection,
  ShowsSection,
  WatchlistSection,
} from "./LibraryOverviewSections";
import { LibraryRowsSkeleton } from "./LibraryRows";
import {
  addSetValue,
  deleteSetValue,
  getDefaultSection,
  getLibraryActionKeys,
  getOptimisticLibrary,
  groupEpisodesByShowAndSeason,
  hasItemsForSection,
  type LibrarySectionFilter,
} from "./library-overview-model";

type LibraryOverviewProps = {
  chronology: LibraryChronologyState;
  library: LibraryResponse | null;
  libraryAction: LibraryActionState;
  onChronologyVisible: () => void;
  onLoadMoreChronology: () => void;
  onOpenMovie: (movieId: string) => void;
  onOpenEpisode: (episodeId: string) => void;
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemoveRecentlyWatchedItem: (item: RecentlyWatchedItem) => void;
  onRemoveWatchlistItem: (item: LibraryWatchlistItem) => void;
};

export function LibraryOverview({
  chronology,
  library,
  libraryAction,
  onChronologyVisible,
  onLoadMoreChronology,
  onOpenMovie,
  onOpenEpisode,
  onOpenShow,
  onOpenShowSeason,
  onRemoveRecentlyWatchedItem,
  onRemoveWatchlistItem,
}: LibraryOverviewProps) {
  const [selectedSection, setSelectedSection] = useState<LibrarySectionFilter | null>(null);
  const [optimisticRemovedKeys, setOptimisticRemovedKeys] = useState<Set<string>>(() => new Set());
  const autoLoadCursorRef = useRef<string | null>(null);

  useEffect(() => {
    if (libraryAction.kind !== "error") {
      return;
    }

    setOptimisticRemovedKeys((current) => deleteSetValue(current, libraryAction.actionKey));
  }, [libraryAction]);

  useEffect(() => {
    if (!library) {
      return;
    }

    const currentKeys = getLibraryActionKeys(library, chronology.items);

    setOptimisticRemovedKeys((current) => {
      let changed = false;
      const next = new Set<string>();

      current.forEach((key) => {
        if (currentKeys.has(key)) {
          next.add(key);
          return;
        }

        changed = true;
      });

      return changed ? next : current;
    });
  }, [chronology.items, library]);

  useEffect(() => {
    if (!library) {
      return;
    }

    const activeSection = selectedSection ?? getDefaultSection(library);

    if (activeSection === "chronology") {
      onChronologyVisible();
    }
  }, [library, onChronologyVisible, selectedSection]);

  useEffect(() => {
    if (chronology.kind !== "loadingMore") {
      autoLoadCursorRef.current = null;
    }
  }, [chronology.kind, chronology.nextCursor]);

  if (!library) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Library unavailable</Text>
        <Text style={styles.statusDetail}>Sign in is active. Library data is not loaded yet.</Text>
      </View>
    );
  }

  const visibleLibrary = getOptimisticLibrary(library, optimisticRemovedKeys);
  const isEmpty =
    visibleLibrary.summary.ratedTitleCount === 0 &&
    visibleLibrary.summary.watchlistItemCount === 0 &&
    visibleLibrary.summary.watchedEpisodeCount === 0 &&
    visibleLibrary.summary.watchedMovieCount === 0 &&
    visibleLibrary.summary.watchedShowCount === 0;
  const hasRatedTitles = visibleLibrary.ratedTitles.length > 0;
  const recentlyWatchedMovies = visibleLibrary.recentlyWatched.filter((item) => item.mediaType === "movie");
  const episodeGroups = groupEpisodesByShowAndSeason(visibleLibrary.watchedEpisodes);
  const hasWatchedEpisodes = visibleLibrary.watchedEpisodes.length > 0;
  const hasRecentlyWatchedMovies = recentlyWatchedMovies.length > 0;
  const hasShows = visibleLibrary.shows.length > 0;
  const hasWatchlist = visibleLibrary.watchlist.length > 0;
  const activeSection = selectedSection ?? getDefaultSection(visibleLibrary);
  const chronologyCount = visibleLibrary.summary.watchedEpisodeCount + visibleLibrary.summary.watchedMovieCount;
  const summaryStats: Array<{ label: string; section: LibrarySectionFilter; value: number }> = [
    { label: "Cronologia", section: "chronology", value: chronologyCount },
    { label: "Shows", section: "shows", value: visibleLibrary.shows.length },
    { label: "Movies", section: "movies", value: visibleLibrary.summary.watchedMovieCount },
    { label: "Episodes", section: "episodes", value: visibleLibrary.summary.watchedEpisodeCount },
    { label: "Watchlist", section: "watchlist", value: visibleLibrary.summary.watchlistItemCount },
    { label: "Rated", section: "rated", value: visibleLibrary.summary.ratedTitleCount },
  ];
  const shouldShowWatchlist = activeSection === "watchlist";
  const shouldShowShows = activeSection === "shows";
  const shouldShowRated = activeSection === "rated";
  const shouldShowHistory = activeSection === "chronology";
  const shouldShowMovies = activeSection === "movies";
  const shouldShowEpisodes = activeSection === "episodes";
  const chronologyItems = chronology.items.length > 0 ? chronology.items : visibleLibrary.recentlyWatched;
  const visibleChronologyItems = chronologyItems.filter((item) => !optimisticRemovedKeys.has(getHistoryActionKey(item)));
  const hideLibraryAction = (actionKey: string) => {
    setOptimisticRemovedKeys((current) => addSetValue(current, actionKey));
  };
  const handleLibraryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!shouldShowHistory || chronology.kind === "loading" || chronology.kind === "loadingMore" || !chronology.nextCursor) {
      return;
    }

    if (!isNearScrollEnd(event.nativeEvent) || autoLoadCursorRef.current === chronology.nextCursor) {
      return;
    }

    autoLoadCursorRef.current = chronology.nextCursor;
    onLoadMoreChronology();
  };

  return (
    <View style={styles.librarySectionFixed}>
      <View style={styles.summaryGrid}>
        {summaryStats.map((stat) => (
          <StatCard
            accessibilityLabel={`Filter library by ${stat.label.toLowerCase()}`}
            isActive={activeSection === stat.section}
            key={stat.section}
            label={stat.label}
            onPress={() => setSelectedSection(stat.section)}
            value={stat.value}
          />
        ))}
      </View>

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.statusLabel}>Your library is empty</Text>
          <Text style={styles.statusDetail}>Saved and watched titles will appear here.</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.libraryListContent}
        onScroll={handleLibraryScroll}
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
        style={styles.libraryListScroll}
      >
        {!isEmpty && activeSection !== "chronology" && !hasItemsForSection(activeSection, visibleLibrary) ? (
          <EmptySection activeSection={activeSection} />
        ) : null}

        {shouldShowShows && hasShows ? (
          <ShowsSection
            onOpenShow={onOpenShow}
            onOpenShowSeason={onOpenShowSeason}
            shows={visibleLibrary.shows}
          />
        ) : null}

        {shouldShowWatchlist && hasWatchlist ? (
          <WatchlistSection
            items={visibleLibrary.watchlist}
            libraryAction={libraryAction}
            onOptimisticRemove={hideLibraryAction}
            onOpenMovie={onOpenMovie}
            onOpenShow={onOpenShow}
            onRemove={onRemoveWatchlistItem}
          />
        ) : null}

        {shouldShowRated && hasRatedTitles ? (
          <RatedSection
            items={visibleLibrary.ratedTitles}
            onOpenMovie={onOpenMovie}
            onOpenShow={onOpenShow}
          />
        ) : null}

        {shouldShowMovies && hasRecentlyWatchedMovies ? (
          <MoviesSection
            items={recentlyWatchedMovies}
            libraryAction={libraryAction}
            onOptimisticRemove={hideLibraryAction}
            onOpenMovie={onOpenMovie}
            onOpenShowSeason={onOpenShowSeason}
            onRemove={onRemoveRecentlyWatchedItem}
          />
        ) : null}

        {shouldShowEpisodes && hasWatchedEpisodes ? (
          <EpisodesSection
            groups={episodeGroups}
            libraryAction={libraryAction}
            onOptimisticRemove={hideLibraryAction}
            onOpenEpisode={onOpenEpisode}
            onOpenShow={onOpenShow}
            onOpenShowSeason={onOpenShowSeason}
            onRemove={onRemoveRecentlyWatchedItem}
          />
        ) : null}

        {shouldShowHistory ? (
          <ChronologySection
            chronology={chronology}
            items={visibleChronologyItems}
            libraryAction={libraryAction}
            onOptimisticRemove={hideLibraryAction}
            onOpenEpisode={onOpenEpisode}
            onOpenMovie={onOpenMovie}
            onOpenShowSeason={onOpenShowSeason}
            onRemove={onRemoveRecentlyWatchedItem}
            onRetry={onChronologyVisible}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

export function LibraryOverviewSkeleton() {
  return (
    <View style={styles.librarySection}>
      <View style={styles.summaryGrid}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Skeleton height={78} key={item} style={styles.skeletonStat} width="30%" />
        ))}
      </View>
      <LibraryRowsSkeleton />
    </View>
  );
}

function isNearScrollEnd(event: NativeScrollEvent) {
  const distanceFromEnd = event.contentSize.height - event.layoutMeasurement.height - event.contentOffset.y;

  return distanceFromEnd < 180;
}
