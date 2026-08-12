import { Pressable, Text, View } from "react-native";

import type { ContinueWatchingShow, LibraryResponse, RecentlyWatchedItem } from "../api/tvlore-api";
import { HoloProfileCard } from "./HoloProfileCard";
import { styles } from "./home-styles";

type LibraryOverviewProps = {
  avatarUrl: string | null;
  library: LibraryResponse | null;
  onOpenMovie: (movieId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  userName: string;
};

export function LibraryOverview({
  avatarUrl,
  library,
  onOpenMovie,
  onOpenShowSeason,
  userName,
}: LibraryOverviewProps) {
  if (!library) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>{userName}</Text>
        <Text style={styles.statusDetail}>Sign in is active. Library data is not loaded yet.</Text>
      </View>
    );
  }

  const isEmpty =
    library.summary.watchedEpisodeCount === 0 &&
    library.summary.watchedMovieCount === 0 &&
    library.summary.watchedShowCount === 0;

  return (
    <View style={styles.librarySection}>
      <HoloProfileCard avatarUrl={avatarUrl} library={library} userName={userName} />

      {isEmpty ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.statusLabel}>Your library is empty</Text>
          <Text style={styles.statusDetail}>Watched titles will appear here after you mark them.</Text>
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
      <Text style={styles.dateText}>{formatWatchedAt(item.watchedAt)}</Text>
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

function formatWatchedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
