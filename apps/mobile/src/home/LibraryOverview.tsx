import { Pressable, Text, View } from "react-native";

import type { ContinueWatchingShow, LibraryResponse, LibraryWatchlistItem, RecentlyWatchedItem } from "../api/tvlore-api";
import { styles } from "./home-styles";

type LibraryOverviewProps = {
  library: LibraryResponse | null;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
};

export function LibraryOverview({
  library,
  onOpenMovie,
  onOpenShow,
  onOpenShowSeason,
}: LibraryOverviewProps) {
  if (!library) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Library unavailable</Text>
        <Text style={styles.statusDetail}>Sign in is active. Library data is not loaded yet.</Text>
      </View>
    );
  }

  const isEmpty =
    library.summary.watchlistItemCount === 0 &&
    library.summary.watchedEpisodeCount === 0 &&
    library.summary.watchedMovieCount === 0 &&
    library.summary.watchedShowCount === 0;

  return (
    <View style={styles.librarySection}>
      <View style={styles.summaryGrid}>
        <SummaryStat label="Shows" value={library.summary.watchedShowCount} />
        <SummaryStat label="Movies" value={library.summary.watchedMovieCount} />
        <SummaryStat label="Episodes" value={library.summary.watchedEpisodeCount} />
        <SummaryStat label="Watchlist" value={library.summary.watchlistItemCount} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.statusLabel}>Your library is empty</Text>
          <Text style={styles.statusDetail}>Saved and watched titles will appear here.</Text>
        </View>
      ) : null}

      {library.watchlist.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Watchlist</Text>
          {library.watchlist.map((item) => (
            <WatchlistRow
              item={item}
              key={`${item.mediaType}-${item.id}`}
              onOpenMovie={onOpenMovie}
              onOpenShow={onOpenShow}
            />
          ))}
        </View>
      ) : null}

      {library.continueWatching.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Continue Watching</Text>
          {library.continueWatching.map((show) => (
            <ContinueWatchingItem key={show.id} onOpenShowSeason={onOpenShowSeason} show={show} />
          ))}
        </View>
      ) : null}

      {library.recentlyWatched.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Recently Watched</Text>
          {library.recentlyWatched.map((item) => (
            <RecentlyWatchedRow
              item={item}
              key={`${item.mediaType}-${item.id}`}
              onOpenMovie={onOpenMovie}
              onOpenShowSeason={onOpenShowSeason}
            />
          ))}
        </View>
      ) : null}
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

function WatchlistRow({
  item,
  onOpenMovie,
  onOpenShow,
}: {
  item: LibraryWatchlistItem;
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
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.statusDetail}>{item.mediaType === "movie" ? "Movie" : "Show"}</Text>
      </View>
      <Text style={styles.dateText}>{formatShortDate(item.createdAt)}</Text>
    </Pressable>
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

function RecentlyWatchedRow({
  item,
  onOpenMovie,
  onOpenShowSeason,
}: {
  item: RecentlyWatchedItem;
  onOpenMovie: (movieId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
}) {
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShowSeason(item.showId, item.seasonNumber);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={openItem}
      style={({ pressed }) => [styles.listItem, pressed ? styles.pressedListItem : null]}
    >
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{getRecentlyWatchedTitle(item)}</Text>
        <Text style={styles.statusDetail}>{getRecentlyWatchedDetail(item)}</Text>
      </View>
      <Text style={styles.dateText}>{formatShortDate(item.watchedAt)}</Text>
    </Pressable>
  );
}

function getRecentlyWatchedTitle(item: RecentlyWatchedItem) {
  return item.mediaType === "movie" ? item.title : item.showTitle;
}

function getRecentlyWatchedDetail(item: RecentlyWatchedItem) {
  return item.mediaType === "movie"
    ? "Movie"
    : `S${item.seasonNumber} E${item.episodeNumber} - ${item.title}`;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
