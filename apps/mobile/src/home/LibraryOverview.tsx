import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View, type ListRenderItemInfo } from "react-native";

import type {
  LibraryResponse,
  LibraryWatchlistItem,
  RecentlyWatchedItem,
} from "../api/tvlore-api";
import { getHistoryActionKey } from "../library/library-action-keys";
import type { LibraryActionState } from "../library/use-library-actions";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import { Button, EmptyState, Skeleton, StatCard, Surface } from "../ui";
import {
  getEpisodeSeasonKey,
  getLibraryFeedItemKey,
  getLibraryFeedItems,
  type LibraryFeedItem,
} from "./library-feed-model";
import {
  addSetValue,
  deleteSetValue,
  getDefaultSection,
  getLibraryActionKeys,
  getOptimisticLibrary,
  type LibrarySectionFilter,
} from "./library-overview-model";
import { styles } from "./home-styles";
import { EmptySection } from "./LibraryOverviewSections";
import {
  LibraryRowsSkeleton,
  LibraryShowRow,
  RatedTitleRow,
  RecentlyWatchedRow,
  WatchlistRow,
} from "./LibraryRows";

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
  const [collapsedSeasonKeys, setCollapsedSeasonKeys] = useState<Set<string>>(() => new Set());
  const [optimisticRemovedKeys, setOptimisticRemovedKeys] = useState<Set<string>>(() => new Set());
  const [selectedSection, setSelectedSection] = useState<LibrarySectionFilter | null>(null);
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
      <Surface>
        <Text style={styles.statusLabel}>Library unavailable</Text>
        <Text style={styles.statusDetail}>Sign in is active. Library data is not loaded yet.</Text>
      </Surface>
    );
  }

  const visibleLibrary = getOptimisticLibrary(library, optimisticRemovedKeys);
  const isEmpty =
    visibleLibrary.summary.ratedTitleCount === 0 &&
    visibleLibrary.summary.watchlistItemCount === 0 &&
    visibleLibrary.summary.watchedEpisodeCount === 0 &&
    visibleLibrary.summary.watchedMovieCount === 0 &&
    visibleLibrary.summary.watchedShowCount === 0;
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
  const chronologyItems = chronology.items.length > 0 ? chronology.items : visibleLibrary.recentlyWatched;
  const visibleChronologyItems = chronologyItems.filter((item) => !optimisticRemovedKeys.has(getHistoryActionKey(item)));
  const feedItems = getLibraryFeedItems({
    activeSection,
    chronology,
    chronologyItems: visibleChronologyItems,
    collapsedSeasonKeys,
    isEmpty,
    library: visibleLibrary,
  });

  const hideLibraryAction = (actionKey: string) => {
    setOptimisticRemovedKeys((current) => addSetValue(current, actionKey));
  };
  const toggleSeason = (showId: string, seasonNumber: number) => {
    const seasonKey = getEpisodeSeasonKey(showId, seasonNumber);

    setCollapsedSeasonKeys((current) => (
      current.has(seasonKey)
        ? deleteSetValue(current, seasonKey)
        : addSetValue(current, seasonKey)
    ));
  };
  const loadMoreHistory = () => {
    if (activeSection !== "chronology" || chronology.kind === "loading" || chronology.kind === "loadingMore" || !chronology.nextCursor) {
      return;
    }

    if (autoLoadCursorRef.current === chronology.nextCursor) {
      return;
    }

    autoLoadCursorRef.current = chronology.nextCursor;
    onLoadMoreChronology();
  };
  const renderLibraryItem = ({ item }: ListRenderItemInfo<LibraryFeedItem>) => {
    if (item.kind === "section-title") {
      return <Text style={styles.listTitle}>{item.title}</Text>;
    }

    if (item.kind === "empty") {
      return <EmptySection activeSection={item.activeSection} />;
    }

    if (item.kind === "skeleton") {
      return <LibraryRowsSkeleton />;
    }

    if (item.kind === "status") {
      if (item.tone === "error" && item.id === "chronology-error") {
        return (
          <View style={styles.statusPanel}>
            <Text style={styles.statusLabel}>Could not load chronology</Text>
            <Text style={styles.errorText}>{item.message}</Text>
            <Button icon="refresh" label="Retry" onPress={onChronologyVisible} />
          </View>
        );
      }

      return <Text style={item.tone === "error" ? styles.errorText : styles.statusDetail}>{item.message}</Text>;
    }

    if (item.kind === "footer") {
      return <Text style={styles.statusDetail}>{item.message}</Text>;
    }

    if (item.kind === "show") {
      return (
        <LibraryShowRow
          onOpenShow={onOpenShow}
          onOpenShowSeason={onOpenShowSeason}
          show={item.show}
        />
      );
    }

    if (item.kind === "watchlist") {
      return (
        <WatchlistRow
          item={item.item}
          libraryAction={libraryAction}
          onOptimisticRemove={hideLibraryAction}
          onOpenMovie={onOpenMovie}
          onOpenShow={onOpenShow}
          onRemove={onRemoveWatchlistItem}
        />
      );
    }

    if (item.kind === "rated") {
      return (
        <RatedTitleRow
          item={item.item}
          onOpenMovie={onOpenMovie}
          onOpenShow={onOpenShow}
        />
      );
    }

    if (item.kind === "history") {
      return (
        <RecentlyWatchedRow
          item={item.item}
          libraryAction={libraryAction}
          onOptimisticRemove={hideLibraryAction}
          onOpenEpisode={onOpenEpisode}
          onOpenMovie={onOpenMovie}
          onOpenShowSeason={onOpenShowSeason}
          onRemove={onRemoveRecentlyWatchedItem}
        />
      );
    }

    if (item.kind === "episode-show-header") {
      return (
        <Pressable
          accessibilityLabel={`Open ${item.group.showTitle}`}
          accessibilityRole="button"
          onPress={() => onOpenShow(item.group.showId)}
          style={({ pressed }) => [styles.groupTitleLink, pressed ? styles.pressedListItem : null]}
        >
          <Text style={styles.groupTitle}>{item.group.showTitle}</Text>
        </Pressable>
      );
    }

    if (item.kind === "episode-season-header") {
      return (
        <View style={styles.groupSeasonHeader}>
          <Pressable
            accessibilityLabel={`Open season ${item.seasonNumber}`}
            accessibilityRole="button"
            onPress={() => onOpenShowSeason(item.showId, item.seasonNumber)}
            style={({ pressed }) => [styles.groupSeasonLink, pressed ? styles.pressedListItem : null]}
          >
            <Text style={styles.groupSubtitle}>Season {item.seasonNumber}</Text>
          </Pressable>
          <View style={styles.groupSeasonMeta}>
            <Text style={styles.statusDetail}>{item.watchedCount} watched</Text>
            <Pressable
              accessibilityLabel={`${item.isCollapsed ? "Expand" : "Collapse"} season ${item.seasonNumber}`}
              accessibilityRole="button"
              accessibilityState={{ expanded: !item.isCollapsed }}
              hitSlop={8}
              onPress={() => toggleSeason(item.showId, item.seasonNumber)}
              style={({ pressed }) => [styles.groupSeasonToggleButton, pressed ? styles.pressedListItem : null]}
            >
              <Text style={styles.groupSeasonToggle}>{item.isCollapsed ? "+" : "-"}</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <RecentlyWatchedRow
        item={item.item}
        libraryAction={libraryAction}
        onOptimisticRemove={hideLibraryAction}
        onOpenEpisode={onOpenEpisode}
        onOpenMovie={noop}
        onOpenShowSeason={onOpenShowSeason}
        onRemove={onRemoveRecentlyWatchedItem}
      />
    );
  };

  return (
    <FlatList
      contentContainerStyle={styles.libraryListContent}
      data={feedItems}
      keyExtractor={getLibraryFeedItemKey}
      ListHeaderComponent={(
        <View style={styles.libraryFeedHeader}>
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
            <EmptyState
              detail="Saved and watched titles will appear here."
              icon="add-circle-outline"
              title="Your library is empty"
            />
          ) : null}
        </View>
      )}
      onEndReached={loadMoreHistory}
      onEndReachedThreshold={0.35}
      renderItem={renderLibraryItem}
      showsVerticalScrollIndicator={false}
      style={styles.libraryListScroll}
    />
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

function noop() {}
