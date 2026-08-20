import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type {
  LibraryRatedTitle,
  LibraryShowItem,
  LibraryWatchlistItem,
  RecentlyWatchedItem,
} from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import {
  getHistoryActionKey,
  getWatchlistActionKey,
} from "../library/library-action-keys";
import {
  type LibraryActionState,
} from "../library/use-library-actions";
import { MediaRow, Skeleton } from "../ui";
import { styles } from "./home-styles";

const swipeConfirmWindowMs = 4000;

export function LibraryRowsSkeleton() {
  return (
    <View style={styles.listSection}>
      <Skeleton height={22} width="46%" />
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonMediaRow}>
          <Skeleton height={64} width={44} />
          <View style={styles.skeletonMediaText}>
            <Skeleton height={18} width="76%" />
            <Skeleton height={14} width="58%" />
          </View>
          <Skeleton height={14} width={48} />
        </View>
      ))}
    </View>
  );
}

export function LibraryShowRow({
  onOpenShow,
  onOpenShowSeason,
  show,
}: {
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  show: LibraryShowItem;
}) {
  const openShow = () => {
    if (show.status === "watching" && show.nextEpisode) {
      onOpenShowSeason(show.id, show.nextEpisode.seasonNumber);
      return;
    }

    onOpenShow(show.id);
  };

  return (
    <MediaRow
      detail={getLibraryShowDetail(show)}
      onPress={openShow}
      posterLabel="TV"
      posterUri={getPosterUri(show.posterPath)}
      title={show.title}
      trailing={getLibraryShowTrailing(show)}
    />
  );
}

export function WatchlistRow({
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

export function RecentlyWatchedRow({
  item,
  libraryAction,
  onOptimisticRemove,
  onOpenEpisode,
  onOpenMovie,
  onRemove,
  onOpenShowSeason,
}: {
  item: RecentlyWatchedItem;
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenEpisode?: (episodeId: string) => void;
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

    if (onOpenEpisode) {
      onOpenEpisode(item.id);
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

export function RatedTitleRow({
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

function getRecentlyWatchedTitle(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.title : item.showTitle;
}

function getRecentlyWatchedPosterUri(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? getPosterUri(item.posterPath)
    : getPosterUri(item.stillPath ?? item.showPosterPath);
}

function getRecentlyWatchedDetail(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? "Movie"
    : `S${item.seasonNumber} E${item.episodeNumber} - ${item.title}`;
}

function getLibraryShowDetail(show: LibraryShowItem) {
  if (show.status === "completed") {
    return `${show.watchedEpisodeCount}/${show.totalEpisodeCount} watched`;
  }

  if (show.status === "watching" && show.nextEpisode) {
    return `Next S${show.nextEpisode.seasonNumber} E${show.nextEpisode.episodeNumber} - ${show.nextEpisode.title}`;
  }

  if (show.inWatchlist && show.rating) {
    return `Saved - Rated ${show.rating}/5`;
  }

  if (show.inWatchlist) {
    return "Saved to watchlist";
  }

  if (show.rating) {
    return `Rated ${show.rating}/5`;
  }

  return "Show";
}

function getLibraryShowTrailing(show: LibraryShowItem) {
  if (show.status === "completed") {
    return "Done";
  }

  if (show.status === "watching") {
    return `${show.percentComplete}%`;
  }

  if (show.rating) {
    return `${show.rating}/5`;
  }

  return show.inWatchlist ? "Saved" : "";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getPosterUri(posterPath: string | null) {
  return posterPath ? getTmdbPosterUrl(posterPath) : null;
}
