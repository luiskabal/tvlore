import { Text, View } from "react-native";

import type { ContinueWatchingShow, LibraryResponse, RecentlyWatchedItem } from "../api/tvlore-api";
import { HoloProfileCard } from "./HoloProfileCard";
import { styles } from "./home-styles";

export function LibraryOverview({
  avatarUrl,
  library,
  userName,
}: {
  avatarUrl: string | null;
  library: LibraryResponse | null;
  userName: string;
}) {
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
            <ContinueWatchingItem key={show.id} show={show} />
          ))}
        </View>
      ) : null}

      {library.recentlyWatched.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Recently Watched</Text>
          {library.recentlyWatched.map((item) => (
            <RecentlyWatchedRow key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ContinueWatchingItem({ show }: { show: ContinueWatchingShow }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{show.title}</Text>
        <Text style={styles.statusDetail}>
          S{show.nextEpisode.seasonNumber} E{show.nextEpisode.episodeNumber} - {show.nextEpisode.title}
        </Text>
      </View>
      <Text style={styles.progressText}>{show.percentComplete}%</Text>
    </View>
  );
}

function RecentlyWatchedRow({ item }: { item: RecentlyWatchedItem }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{getRecentlyWatchedTitle(item)}</Text>
        <Text style={styles.statusDetail}>{getRecentlyWatchedDetail(item)}</Text>
      </View>
      <Text style={styles.dateText}>{formatWatchedAt(item.watchedAt)}</Text>
    </View>
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
