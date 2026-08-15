import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
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
  library: LibraryResponse | null;
  libraryAction: LibraryActionState;
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
  library,
  libraryAction,
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
  const hideLibraryAction = (actionKey: string) => {
    setOptimisticRemovedKeys((current) => addSetValue(current, actionKey));
  };

  return (
    <View style={styles.librarySectionFixed}>
      <View style={styles.summaryGrid}>
        {summaryStats.map((stat) => (
          <SummaryStat
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

        {!isEmpty && activeSection !== "recommendations" && !hasItemsForSection(activeSection, visibleLibrary) ? (
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

        {shouldShowHistory && hasRecentlyWatched ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Cronologia</Text>
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

function EmptySection({ activeSection }: { activeSection: LibrarySectionFilter }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.statusLabel}>{getEmptySectionTitle(activeSection)}</Text>
      <Text style={styles.statusDetail}>{getEmptySectionDetail(activeSection)}</Text>
    </View>
  );
}

function SummaryStat({
  isActive,
  label,
  onPress,
  value,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
  value: number;
}) {
  return (
    <Pressable
      accessibilityLabel={`Filter library by ${label.toLowerCase()}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.summaryCard,
        isActive ? styles.summaryCardActive : null,
        pressed ? styles.pressedListItem : null,
      ]}
    >
      <Text style={[styles.summaryValue, isActive ? styles.summaryValueActive : null]}>{value}</Text>
      <Text style={[styles.summaryLabel, isActive ? styles.summaryLabelActive : null]}>{label}</Text>
    </Pressable>
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

function getLibraryActionKeys(library: LibraryResponse) {
  return new Set([
    ...library.recentlyWatched.map(getHistoryActionKey),
    ...library.watchlist.map(getWatchlistActionKey),
    ...library.watchedEpisodes.map(getHistoryActionKey),
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

function getRecentlyWatchedPosterPath(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.posterPath : null;
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
