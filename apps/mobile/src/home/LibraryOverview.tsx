import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type {
  ContinueWatchingShow,
  LibraryRatedTitle,
  LibraryResponse,
  LibraryWatchlistItem,
  RecommendationsResponse,
  RecentlyWatchedItem,
} from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import {
  getHistoryActionKey,
  getWatchlistActionKey,
  type LibraryActionState,
} from "../library/use-library-actions";
import { styles } from "./home-styles";
import { RecommendationsPanel } from "./RecommendationsPanel";

type LibrarySectionFilter = "all" | "history" | "rated" | "watching" | "watchlist";

const librarySections: Array<{ label: string; value: LibrarySectionFilter }> = [
  { label: "All", value: "all" },
  { label: "Watching", value: "watching" },
  { label: "Watchlist", value: "watchlist" },
  { label: "Rated", value: "rated" },
  { label: "History", value: "history" },
];
const swipeConfirmWindowMs = 4000;

type LibraryOverviewProps = {
  library: LibraryResponse | null;
  libraryAction: LibraryActionState;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemoveRecentlyWatchedItem: (item: RecentlyWatchedItem) => void;
  onRemoveWatchlistItem: (item: LibraryWatchlistItem) => void;
  recommendations: RecommendationsResponse | null;
};

export function LibraryOverview({
  library,
  libraryAction,
  onOpenMovie,
  onOpenShow,
  onOpenShowSeason,
  onRemoveRecentlyWatchedItem,
  onRemoveWatchlistItem,
  recommendations,
}: LibraryOverviewProps) {
  const [selectedSection, setSelectedSection] = useState<LibrarySectionFilter | null>(null);
  const [optimisticRemovedKeys, setOptimisticRemovedKeys] = useState<Set<string>>(() => new Set());

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

    const currentKeys = getLibraryActionKeys(library);

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
  }, [library]);

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
  const hasContinueWatching = visibleLibrary.continueWatching.length > 0;
  const hasRatedTitles = visibleLibrary.ratedTitles.length > 0;
  const hasRecentlyWatched = visibleLibrary.recentlyWatched.length > 0;
  const hasWatchlist = visibleLibrary.watchlist.length > 0;
  const activeSection = selectedSection ?? getDefaultSection(visibleLibrary);
  const shouldShowWatchlist = activeSection === "all" || activeSection === "watchlist";
  const shouldShowContinueWatching = activeSection === "all" || activeSection === "watching";
  const shouldShowRated = activeSection === "all" || activeSection === "rated";
  const shouldShowHistory = activeSection === "all" || activeSection === "history";
  const hideLibraryAction = (actionKey: string) => {
    setOptimisticRemovedKeys((current) => addSetValue(current, actionKey));
  };

  return (
    <View style={styles.librarySectionFixed}>
      <View style={styles.summaryGrid}>
        <SummaryStat label="Shows" value={visibleLibrary.summary.watchedShowCount} />
        <SummaryStat label="Movies" value={visibleLibrary.summary.watchedMovieCount} />
        <SummaryStat label="Episodes" value={visibleLibrary.summary.watchedEpisodeCount} />
        <SummaryStat label="Watchlist" value={visibleLibrary.summary.watchlistItemCount} />
        <SummaryStat label="Rated" value={visibleLibrary.summary.ratedTitleCount} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.statusLabel}>Your library is empty</Text>
          <Text style={styles.statusDetail}>Saved and watched titles will appear here.</Text>
        </View>
      ) : null}

      {!isEmpty ? (
        <LibrarySectionTabs activeSection={activeSection} onSelect={setSelectedSection} />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.libraryListContent}
        showsVerticalScrollIndicator={false}
        style={styles.libraryListScroll}
      >
        {!isEmpty && activeSection === "all" ? (
          <RecommendationsPanel
            onOpenMovie={onOpenMovie}
            onOpenShow={onOpenShow}
            recommendations={recommendations}
          />
        ) : null}

        {!isEmpty && activeSection !== "all" && !hasItemsForSection(activeSection, visibleLibrary) ? (
          <EmptySection activeSection={activeSection} />
        ) : null}

        {shouldShowContinueWatching && hasContinueWatching ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Continue Watching</Text>
            {visibleLibrary.continueWatching.map((show) => (
              <ContinueWatchingItem key={show.id} onOpenShowSeason={onOpenShowSeason} show={show} />
            ))}
          </View>
        ) : null}

        {shouldShowWatchlist && hasWatchlist ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Watchlist</Text>
            {visibleLibrary.watchlist.map((item) => (
              <WatchlistRow
                item={item}
                key={`${item.mediaType}-${item.id}`}
                libraryAction={libraryAction}
                onOptimisticRemove={hideLibraryAction}
                onOpenMovie={onOpenMovie}
                onOpenShow={onOpenShow}
                onRemove={onRemoveWatchlistItem}
              />
            ))}
          </View>
        ) : null}

        {shouldShowRated && hasRatedTitles ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Rated</Text>
            {visibleLibrary.ratedTitles.map((item) => (
              <RatedTitleRow
                item={item}
                key={`${item.mediaType}-${item.id}`}
                onOpenMovie={onOpenMovie}
                onOpenShow={onOpenShow}
              />
            ))}
          </View>
        ) : null}

        {shouldShowHistory && hasRecentlyWatched ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Recently Watched</Text>
            {visibleLibrary.recentlyWatched.map((item) => (
              <RecentlyWatchedRow
                item={item}
                key={`${item.mediaType}-${item.id}`}
                libraryAction={libraryAction}
                onOptimisticRemove={hideLibraryAction}
                onOpenMovie={onOpenMovie}
                onOpenShowSeason={onOpenShowSeason}
                onRemove={onRemoveRecentlyWatchedItem}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function LibraryOverviewSkeleton() {
  return (
    <View style={styles.librarySection}>
      <View style={styles.summaryGrid}>
        <View style={[styles.skeletonBlock, styles.skeletonStat]} />
        <View style={[styles.skeletonBlock, styles.skeletonStat]} />
        <View style={[styles.skeletonBlock, styles.skeletonStat]} />
        <View style={[styles.skeletonBlock, styles.skeletonStat]} />
      </View>
      <View style={[styles.skeletonBlock, styles.skeletonListItem]} />
      <View style={[styles.skeletonBlock, styles.skeletonListItem]} />
    </View>
  );
}

function LibrarySectionTabs({
  activeSection,
  onSelect,
}: {
  activeSection: LibrarySectionFilter;
  onSelect: (section: LibrarySectionFilter) => void;
}) {
  return (
    <View style={styles.sectionTabs}>
      {librarySections.map((section) => {
        const isActive = activeSection === section.value;

        return (
          <Pressable
            accessibilityRole="button"
            key={section.value}
            onPress={() => onSelect(section.value)}
            style={[styles.sectionTab, isActive ? styles.sectionTabActive : null]}
          >
            <Text style={[styles.sectionTabText, isActive ? styles.sectionTabTextActive : null]}>
              {section.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptySection({ activeSection }: { activeSection: LibrarySectionFilter }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.statusLabel}>{getEmptySectionTitle(activeSection)}</Text>
      <Text style={styles.statusDetail}>{getEmptySectionDetail(activeSection)}</Text>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ContinueWatchingItem({
  onOpenShowSeason,
  show,
}: {
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  show: ContinueWatchingShow;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpenShowSeason(show.id, show.nextEpisode.seasonNumber)}
      style={({ pressed }) => [styles.listItem, pressed ? styles.pressedListItem : null]}
    >
      <LibraryPoster label="TV" posterPath={show.posterPath} />
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{show.title}</Text>
        <Text style={styles.statusDetail}>
          S{show.nextEpisode.seasonNumber} E{show.nextEpisode.episodeNumber} - {show.nextEpisode.title}
        </Text>
      </View>
      <Text style={styles.progressText}>{show.percentComplete}%</Text>
    </Pressable>
  );
}

function WatchlistRow({
  item,
  libraryAction,
  onOptimisticRemove,
  onOpenMovie,
  onRemove,
  onOpenShow,
}: {
  item: LibraryWatchlistItem;
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenMovie: (movieId: string) => void;
  onRemove: (item: LibraryWatchlistItem) => void;
  onOpenShow: (showId: string) => void;
}) {
  const actionKey = getWatchlistActionKey(item);
  const isRemoving = libraryAction.kind === "loading" && libraryAction.actionKey === actionKey;
  const errorMessage = libraryAction.kind === "error" && libraryAction.actionKey === actionKey
    ? libraryAction.message
    : null;
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShow(item.id);
  };

  return (
    <SwipeableActionRow
      actionLabel="Remove"
      isLoading={isRemoving}
      loadingLabel="Removing"
      onAction={() => {
        onOptimisticRemove(actionKey);
        onRemove(item);
      }}
    >
      <View style={styles.actionListItem}>
        <Pressable
          accessibilityRole="button"
          onPress={openItem}
          style={({ pressed }) => [styles.listItemRow, pressed ? styles.pressedListItem : null]}
        >
          <LibraryPoster label={item.mediaType === "movie" ? "M" : "TV"} posterPath={item.posterPath} />
          <View style={styles.listText}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.statusDetail}>{item.mediaType === "movie" ? "Movie" : "Show"}</Text>
          </View>
          <Text style={styles.dateText}>{formatShortDate(item.createdAt)}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </SwipeableActionRow>
  );
}

function RecentlyWatchedRow({
  item,
  libraryAction,
  onOptimisticRemove,
  onOpenMovie,
  onRemove,
  onOpenShowSeason,
}: {
  item: RecentlyWatchedItem;
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenMovie: (movieId: string) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
}) {
  const actionKey = getHistoryActionKey(item);
  const isRemoving = libraryAction.kind === "loading" && libraryAction.actionKey === actionKey;
  const errorMessage = libraryAction.kind === "error" && libraryAction.actionKey === actionKey
    ? libraryAction.message
    : null;
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShowSeason(item.showId, item.seasonNumber);
  };

  return (
    <SwipeableActionRow
      actionLabel="Undo"
      isLoading={isRemoving}
      loadingLabel="Undoing"
      onAction={() => {
        onOptimisticRemove(actionKey);
        onRemove(item);
      }}
    >
      <View style={styles.actionListItem}>
        <Pressable
          accessibilityRole="button"
          onPress={openItem}
          style={({ pressed }) => [styles.listItemRow, pressed ? styles.pressedListItem : null]}
        >
          <LibraryPoster label={item.mediaType === "movie" ? "M" : "E"} posterPath={getRecentlyWatchedPosterPath(item)} />
          <View style={styles.listText}>
            <Text style={styles.itemTitle}>{getRecentlyWatchedTitle(item)}</Text>
            <Text style={styles.statusDetail}>{getRecentlyWatchedDetail(item)}</Text>
          </View>
          <Text style={styles.dateText}>{formatShortDate(item.watchedAt)}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </SwipeableActionRow>
  );
}

function RatedTitleRow({
  item,
  onOpenMovie,
  onOpenShow,
}: {
  item: LibraryRatedTitle;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
}) {
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShow(item.id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={openItem}
      style={({ pressed }) => [styles.listItem, pressed ? styles.pressedListItem : null]}
    >
      <LibraryPoster label={item.mediaType === "movie" ? "M" : "TV"} posterPath={item.posterPath} />
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.statusDetail}>
          {item.mediaType === "movie" ? "Movie" : "Show"} - Updated {formatShortDate(item.updatedAt)}
        </Text>
      </View>
      <Text style={styles.progressText}>{item.rating}/5</Text>
    </Pressable>
  );
}

function LibraryPoster({ label, posterPath }: { label: string; posterPath: string | null }) {
  if (posterPath) {
    return <Image source={{ uri: getTmdbPosterUrl(posterPath) }} style={styles.libraryPoster} />;
  }

  return (
    <View style={styles.libraryPosterPlaceholder}>
      <Text style={styles.libraryPosterPlaceholderText}>{label}</Text>
    </View>
  );
}

function SwipeableActionRow({
  actionLabel,
  children,
  isLoading,
  loadingLabel,
  onAction,
}: {
  actionLabel: string;
  children: ReactNode;
  isLoading: boolean;
  loadingLabel: string;
  onAction: () => void;
}) {
  const [isArmed, setIsArmed] = useState(false);
  const disarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmLabel = `Confirm ${actionLabel.toLowerCase()}`;

  const clearDisarmTimeout = () => {
    if (!disarmTimeoutRef.current) {
      return;
    }

    clearTimeout(disarmTimeoutRef.current);
    disarmTimeoutRef.current = null;
  };
  const armAction = () => {
    clearDisarmTimeout();
    setIsArmed(true);
    disarmTimeoutRef.current = setTimeout(() => {
      setIsArmed(false);
      disarmTimeoutRef.current = null;
    }, swipeConfirmWindowMs);
  };
  const confirmAction = () => {
    if (isLoading) {
      return;
    }

    clearDisarmTimeout();
    setIsArmed(false);
    onAction();
  };

  useEffect(() => {
    if (isLoading) {
      clearDisarmTimeout();
      setIsArmed(false);
    }
  }, [isLoading]);

  useEffect(() => () => clearDisarmTimeout(), []);

  return (
    <Swipeable
      containerStyle={styles.swipeableRow}
      onSwipeableOpen={(direction) => {
        if (direction !== "right" || isLoading) {
          return;
        }

        if (isArmed) {
          confirmAction();
          return;
        }

        armAction();
      }}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={confirmAction}
            style={[
              styles.swipeActionButton,
              isArmed ? styles.swipeActionButtonArmed : null,
              isLoading ? styles.disabledButton : null,
            ]}
          >
            <Text style={styles.swipeActionButtonText}>
              {isLoading ? loadingLabel : isArmed ? confirmLabel : actionLabel}
            </Text>
          </Pressable>
        </View>
      )}
      rightThreshold={isArmed ? 12 : 44}
    >
      {children}
    </Swipeable>
  );
}

function hasItemsForSection(activeSection: LibrarySectionFilter, library: LibraryResponse) {
  if (activeSection === "watching") {
    return library.continueWatching.length > 0;
  }

  if (activeSection === "watchlist") {
    return library.watchlist.length > 0;
  }

  if (activeSection === "rated") {
    return library.ratedTitles.length > 0;
  }

  if (activeSection === "history") {
    return library.recentlyWatched.length > 0;
  }

  return true;
}

function getOptimisticLibrary(library: LibraryResponse, removedKeys: Set<string>): LibraryResponse {
  const recentlyWatched = library.recentlyWatched.filter((item) => !removedKeys.has(getHistoryActionKey(item)));
  const watchlist = library.watchlist.filter((item) => !removedKeys.has(getWatchlistActionKey(item)));
  const removedRecentlyWatched = library.recentlyWatched.filter((item) => removedKeys.has(getHistoryActionKey(item)));
  const removedWatchlistCount = library.watchlist.length - watchlist.length;
  const removedMovieCount = removedRecentlyWatched.filter((item) => item.mediaType === "movie").length;
  const removedEpisodeCount = removedRecentlyWatched.filter((item) => item.mediaType === "episode").length;

  return {
    ...library,
    recentlyWatched,
    summary: {
      ...library.summary,
      watchedEpisodeCount: Math.max(0, library.summary.watchedEpisodeCount - removedEpisodeCount),
      watchedMovieCount: Math.max(0, library.summary.watchedMovieCount - removedMovieCount),
      watchlistItemCount: Math.max(0, library.summary.watchlistItemCount - removedWatchlistCount),
    },
    watchlist,
  };
}

function getLibraryActionKeys(library: LibraryResponse) {
  return new Set([
    ...library.recentlyWatched.map(getHistoryActionKey),
    ...library.watchlist.map(getWatchlistActionKey),
  ]);
}

function addSetValue(values: Set<string>, value: string) {
  if (values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.add(value);
  return next;
}

function deleteSetValue(values: Set<string>, value: string) {
  if (!values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.delete(value);
  return next;
}

function getDefaultSection(library: LibraryResponse): LibrarySectionFilter {
  return library.continueWatching.length > 0 ? "watching" : "all";
}

function getRecentlyWatchedTitle(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.title : item.showTitle;
}

function getRecentlyWatchedPosterPath(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.posterPath : null;
}

function getRecentlyWatchedDetail(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? "Movie"
    : `S${item.seasonNumber} E${item.episodeNumber} - ${item.title}`;
}

function getEmptySectionTitle(activeSection: LibrarySectionFilter) {
  if (activeSection === "watching") {
    return "Nothing in progress";
  }

  if (activeSection === "watchlist") {
    return "No saved titles";
  }

  if (activeSection === "rated") {
    return "No rated titles";
  }

  return "No watch history";
}

function getEmptySectionDetail(activeSection: LibrarySectionFilter) {
  if (activeSection === "watching") {
    return "Shows appear here after you mark at least one episode watched.";
  }

  if (activeSection === "watchlist") {
    return "Saved shows and movies will appear here.";
  }

  if (activeSection === "rated") {
    return "Rated shows and movies will appear here.";
  }

  return "Watched movies and episodes will appear here.";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
