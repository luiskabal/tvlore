import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type {
  ContinueWatchingShow,
  LibraryRatedTitle,
  LibraryResponse,
  LibraryWatchlistItem,
  RecommendationItem,
  RecommendationsResponse,
  RecentlyWatchedItem,
  WatchedEpisodeItem,
} from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import {
  getHistoryActionKey,
  getWatchlistActionKey,
  type LibraryActionState,
} from "../library/use-library-actions";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import { Button, MediaRow, Skeleton, StatCard } from "../ui";
import { styles } from "./home-styles";
import { RecommendationsPanel } from "./RecommendationsPanel";
import type { RecommendationActionState } from "./use-recommendation-actions";

type LibrarySectionFilter =
  | "chronology"
  | "episodes"
  | "movies"
  | "rated"
  | "recommendations"
  | "watching"
  | "watchlist";

type EpisodeGroup = {
  seasons: Array<{
    episodes: WatchedEpisodeItem[];
    seasonNumber: number;
  }>;
  showId: string;
  showTitle: string;
};

const swipeConfirmWindowMs = 4000;

type LibraryOverviewProps = {
  chronology: LibraryChronologyState;
  library: LibraryResponse | null;
  libraryAction: LibraryActionState;
  onChronologyVisible: () => void;
  onLoadMoreChronology: () => void;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemoveRecentlyWatchedItem: (item: RecentlyWatchedItem) => void;
  onRemoveWatchlistItem: (item: LibraryWatchlistItem) => void;
  onSaveRecommendation: (item: RecommendationItem) => Promise<void>;
  recommendationAction: RecommendationActionState;
  recommendations: RecommendationsResponse | null;
};

export function LibraryOverview({
  chronology,
  library,
  libraryAction,
  onChronologyVisible,
  onLoadMoreChronology,
  onOpenMovie,
  onOpenShow,
  onOpenShowSeason,
  onRemoveRecentlyWatchedItem,
  onRemoveWatchlistItem,
  onSaveRecommendation,
  recommendationAction,
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
  const recentlyWatchedMovies = visibleLibrary.recentlyWatched.filter((item) => item.mediaType === "movie");
  const episodeGroups = groupEpisodesByShowAndSeason(visibleLibrary.watchedEpisodes);
  const hasWatchedEpisodes = visibleLibrary.watchedEpisodes.length > 0;
  const hasRecentlyWatchedMovies = recentlyWatchedMovies.length > 0;
  const hasWatchlist = visibleLibrary.watchlist.length > 0;
  const activeSection = selectedSection ?? getDefaultSection(visibleLibrary);
  const chronologyCount = visibleLibrary.summary.watchedEpisodeCount + visibleLibrary.summary.watchedMovieCount;
  const recommendationCount = recommendations?.items.length ?? 0;
  const summaryStats: Array<{ label: string; section: LibrarySectionFilter; value: number }> = [
    { label: "Cronologia", section: "chronology", value: chronologyCount },
    { label: "Shows", section: "watching", value: visibleLibrary.summary.watchedShowCount },
    { label: "Movies", section: "movies", value: visibleLibrary.summary.watchedMovieCount },
    { label: "Episodes", section: "episodes", value: visibleLibrary.summary.watchedEpisodeCount },
    { label: "Watchlist", section: "watchlist", value: visibleLibrary.summary.watchlistItemCount },
    { label: "Rated", section: "rated", value: visibleLibrary.summary.ratedTitleCount },
    { label: "For you", section: "recommendations", value: recommendationCount },
  ];
  const shouldShowWatchlist = activeSection === "watchlist";
  const shouldShowContinueWatching = activeSection === "watching";
  const shouldShowRated = activeSection === "rated";
  const shouldShowHistory = activeSection === "chronology";
  const shouldShowMovies = activeSection === "movies";
  const shouldShowEpisodes = activeSection === "episodes";
  const shouldShowRecommendations = activeSection === "recommendations";
  const chronologyItems = chronology.items.length > 0 ? chronology.items : visibleLibrary.recentlyWatched;
  const visibleChronologyItems = chronologyItems.filter((item) => !optimisticRemovedKeys.has(getHistoryActionKey(item)));
  const hideLibraryAction = (actionKey: string) => {
    setOptimisticRemovedKeys((current) => addSetValue(current, actionKey));
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
        showsVerticalScrollIndicator={false}
        style={styles.libraryListScroll}
      >
        {!isEmpty && shouldShowRecommendations ? (
          <RecommendationsPanel
            onOpenMovie={onOpenMovie}
            onOpenShow={onOpenShow}
            onSaveToWatchlist={onSaveRecommendation}
            recommendationAction={recommendationAction}
            recommendations={recommendations}
          />
        ) : null}

        {!isEmpty && activeSection !== "recommendations" && activeSection !== "chronology" && !hasItemsForSection(activeSection, visibleLibrary) ? (
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

        {shouldShowMovies && hasRecentlyWatchedMovies ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Movies</Text>
            {recentlyWatchedMovies.map((item) => (
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

        {shouldShowEpisodes && hasWatchedEpisodes ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Episodes</Text>
            {episodeGroups.map((group) => (
              <EpisodeShowGroup
                group={group}
                key={group.showId}
                libraryAction={libraryAction}
                onOptimisticRemove={hideLibraryAction}
                onOpenShowSeason={onOpenShowSeason}
                onRemove={onRemoveRecentlyWatchedItem}
              />
            ))}
          </View>
        ) : null}

        {shouldShowHistory ? (
          <ChronologySection
            chronology={chronology}
            items={visibleChronologyItems}
            libraryAction={libraryAction}
            onLoadMore={onLoadMoreChronology}
            onOptimisticRemove={hideLibraryAction}
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
        <Skeleton height={58} style={styles.skeletonStat} />
        <Skeleton height={58} style={styles.skeletonStat} />
        <Skeleton height={58} style={styles.skeletonStat} />
        <Skeleton height={58} style={styles.skeletonStat} />
      </View>
      <Skeleton height={94} />
      <Skeleton height={94} />
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

function ContinueWatchingItem({
  onOpenShowSeason,
  show,
}: {
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  show: ContinueWatchingShow;
}) {
  return (
    <MediaRow
      detail={`S${show.nextEpisode.seasonNumber} E${show.nextEpisode.episodeNumber} - ${show.nextEpisode.title}`}
      onPress={() => onOpenShowSeason(show.id, show.nextEpisode.seasonNumber)}
      posterLabel="TV"
      posterUri={getPosterUri(show.posterPath)}
      title={show.title}
      trailing={`${show.percentComplete}%`}
    />
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
        <MediaRow
          detail={item.mediaType === "movie" ? "Movie" : "Show"}
          frame={false}
          onPress={openItem}
          posterLabel={item.mediaType === "movie" ? "M" : "TV"}
          posterUri={getPosterUri(item.posterPath)}
          title={item.title}
          trailing={formatShortDate(item.createdAt)}
        />
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
        <MediaRow
          detail={getRecentlyWatchedDetail(item)}
          frame={false}
          onPress={openItem}
          posterLabel={item.mediaType === "movie" ? "M" : "E"}
          posterUri={getRecentlyWatchedPosterUri(item)}
          title={getRecentlyWatchedTitle(item)}
          trailing={formatShortDate(item.watchedAt)}
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </SwipeableActionRow>
  );
}

function ChronologySection({
  chronology,
  items,
  libraryAction,
  onLoadMore,
  onOptimisticRemove,
  onOpenMovie,
  onOpenShowSeason,
  onRemove,
  onRetry,
}: {
  chronology: LibraryChronologyState;
  items: RecentlyWatchedItem[];
  libraryAction: LibraryActionState;
  onLoadMore: () => void;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenMovie: (movieId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
  onRetry: () => void;
}) {
  if (chronology.kind === "loading" && items.length === 0) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Loading chronology</Text>
        <Text style={styles.statusDetail}>Fetching your watched history by date.</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return chronology.kind === "error" ? (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Could not load chronology</Text>
        <Text style={styles.errorText}>{chronology.message}</Text>
        <Button label="Retry" onPress={onRetry} />
      </View>
    ) : (
      <EmptySection activeSection="chronology" />
    );
  }

  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Cronologia</Text>
      {chronology.kind === "loading" ? <Text style={styles.statusDetail}>Loading full history...</Text> : null}
      {chronology.kind === "error" ? <Text style={styles.errorText}>{chronology.message}</Text> : null}
      {items.map((item) => (
        <RecentlyWatchedRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          libraryAction={libraryAction}
          onOptimisticRemove={onOptimisticRemove}
          onOpenMovie={onOpenMovie}
          onOpenShowSeason={onOpenShowSeason}
          onRemove={onRemove}
        />
      ))}
      {chronology.nextCursor ? (
        <Button
          disabled={chronology.kind === "loadingMore"}
          isLoading={chronology.kind === "loadingMore"}
          label="Load more"
          loadingLabel="Loading"
          onPress={onLoadMore}
        />
      ) : null}
    </View>
  );
}

function EpisodeShowGroup({
  group,
  libraryAction,
  onOptimisticRemove,
  onOpenShowSeason,
  onRemove,
}: {
  group: EpisodeGroup;
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
}) {
  const [collapsedSeasons, setCollapsedSeasons] = useState<Set<number>>(() => new Set());
  const toggleSeason = (seasonNumber: number) => {
    setCollapsedSeasons((current) => (
      current.has(seasonNumber)
        ? deleteSetValue(current, seasonNumber)
        : addSetValue(current, seasonNumber)
    ));
  };

  return (
    <View style={styles.groupPanel}>
      <Text style={styles.groupTitle}>{group.showTitle}</Text>
      {group.seasons.map((season) => (
        <EpisodeSeasonGroup
          episodes={season.episodes}
          isCollapsed={collapsedSeasons.has(season.seasonNumber)}
          key={`${group.showId}-${season.seasonNumber}`}
          libraryAction={libraryAction}
          onOptimisticRemove={onOptimisticRemove}
          onOpenShowSeason={onOpenShowSeason}
          onRemove={onRemove}
          onToggle={() => toggleSeason(season.seasonNumber)}
          seasonNumber={season.seasonNumber}
        />
      ))}
    </View>
  );
}

function EpisodeSeasonGroup({
  episodes,
  isCollapsed,
  libraryAction,
  onOptimisticRemove,
  onOpenShowSeason,
  onRemove,
  onToggle,
  seasonNumber,
}: {
  episodes: WatchedEpisodeItem[];
  isCollapsed: boolean;
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
  onToggle: () => void;
  seasonNumber: number;
}) {
  return (
    <View style={styles.groupSeason}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: !isCollapsed }}
        onPress={onToggle}
        style={({ pressed }) => [styles.groupSeasonHeader, pressed ? styles.pressedListItem : null]}
      >
        <Text style={styles.groupSubtitle}>Season {seasonNumber}</Text>
        <View style={styles.groupSeasonMeta}>
          <Text style={styles.statusDetail}>{episodes.length} watched</Text>
          <Text style={styles.groupSeasonToggle}>{isCollapsed ? "+" : "-"}</Text>
        </View>
      </Pressable>
      {isCollapsed
        ? null
        : episodes.map((episode) => (
            <RecentlyWatchedRow
              item={episode}
              key={episode.id}
              libraryAction={libraryAction}
              onOptimisticRemove={onOptimisticRemove}
              onOpenMovie={noop}
              onOpenShowSeason={onOpenShowSeason}
              onRemove={onRemove}
            />
          ))}
    </View>
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
    <MediaRow
      detail={`${item.mediaType === "movie" ? "Movie" : "Show"} - Updated ${formatShortDate(item.updatedAt)}`}
      onPress={openItem}
      posterLabel={item.mediaType === "movie" ? "M" : "TV"}
      posterUri={getPosterUri(item.posterPath)}
      title={item.title}
      trailing={`${item.rating}/5`}
    />
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
  if (activeSection === "chronology") {
    return library.recentlyWatched.length > 0;
  }

  if (activeSection === "watching") {
    return library.continueWatching.length > 0;
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

  if (activeSection === "recommendations") {
    return true;
  }

  return true;
}

function getOptimisticLibrary(library: LibraryResponse, removedKeys: Set<string>): LibraryResponse {
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

function getLibraryActionKeys(library: LibraryResponse, chronologyItems: RecentlyWatchedItem[] = []) {
  return new Set([
    ...library.recentlyWatched.map(getHistoryActionKey),
    ...library.watchlist.map(getWatchlistActionKey),
    ...library.watchedEpisodes.map(getHistoryActionKey),
    ...chronologyItems.map(getHistoryActionKey),
  ]);
}

function addSetValue<T>(values: Set<T>, value: T) {
  if (values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.add(value);
  return next;
}

function deleteSetValue<T>(values: Set<T>, value: T) {
  if (!values.has(value)) {
    return values;
  }

  const next = new Set(values);
  next.delete(value);
  return next;
}

function getDefaultSection(library: LibraryResponse): LibrarySectionFilter {
  return library.continueWatching.length > 0 ? "watching" : "chronology";
}

function getRecentlyWatchedTitle(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.title : item.showTitle;
}

function getRecentlyWatchedPosterUri(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? getPosterUri(item.posterPath) : null;
}

function getRecentlyWatchedDetail(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? "Movie"
    : `S${item.seasonNumber} E${item.episodeNumber} - ${item.title}`;
}

function getEmptySectionTitle(activeSection: LibrarySectionFilter) {
  if (activeSection === "chronology") {
    return "No watch history";
  }

  if (activeSection === "watching") {
    return "Nothing in progress";
  }

  if (activeSection === "watchlist") {
    return "No saved titles";
  }

  if (activeSection === "movies") {
    return "No recent movies";
  }

  if (activeSection === "episodes") {
    return "No recent episodes";
  }

  if (activeSection === "rated") {
    return "No rated titles";
  }

  return "No activity";
}

function getEmptySectionDetail(activeSection: LibrarySectionFilter) {
  if (activeSection === "chronology") {
    return "Watched movies and episodes will appear here by date.";
  }

  if (activeSection === "watching") {
    return "Shows appear here after you mark at least one episode watched.";
  }

  if (activeSection === "watchlist") {
    return "Saved shows and movies will appear here.";
  }

  if (activeSection === "movies") {
    return "Watched movies will appear here.";
  }

  if (activeSection === "episodes") {
    return "Watched episodes will appear here.";
  }

  if (activeSection === "rated") {
    return "Rated shows and movies will appear here.";
  }

  return "Library activity will appear here.";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function noop() {}

function getPosterUri(posterPath: string | null) {
  return posterPath ? getTmdbPosterUrl(posterPath) : null;
}

function groupEpisodesByShowAndSeason(
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
