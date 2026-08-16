import { Text, View } from "react-native";

import type {
  ContinueWatchingShow,
  LibraryRatedTitle,
  LibraryWatchlistItem,
  RecentlyWatchedItem,
} from "../api/tvlore-api";
import type { LibraryActionState } from "../library/use-library-actions";
import type { LibraryChronologyState } from "../library/use-library-chronology";
import { AppText, Button } from "../ui";
import { styles } from "./home-styles";
import {
  type EpisodeGroup,
  type LibrarySectionFilter,
} from "./library-overview-model";
import {
  ContinueWatchingItem,
  EpisodeShowGroup,
  LibraryRowsSkeleton,
  RatedTitleRow,
  RecentlyWatchedRow,
  WatchlistRow,
} from "./LibraryRows";

export function EmptySection({ activeSection }: { activeSection: LibrarySectionFilter }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.statusLabel}>{getEmptySectionTitle(activeSection)}</Text>
      <Text style={styles.statusDetail}>{getEmptySectionDetail(activeSection)}</Text>
    </View>
  );
}

export function ContinueWatchingSection({
  onOpenShowSeason,
  shows,
}: {
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  shows: ContinueWatchingShow[];
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Continue Watching</Text>
      {shows.map((show) => (
        <ContinueWatchingItem key={show.id} onOpenShowSeason={onOpenShowSeason} show={show} />
      ))}
    </View>
  );
}

export function WatchlistSection({
  items,
  libraryAction,
  onOptimisticRemove,
  onOpenMovie,
  onOpenShow,
  onRemove,
}: {
  items: LibraryWatchlistItem[];
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onRemove: (item: LibraryWatchlistItem) => void;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Watchlist</Text>
      {items.map((item) => (
        <WatchlistRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          libraryAction={libraryAction}
          onOptimisticRemove={onOptimisticRemove}
          onOpenMovie={onOpenMovie}
          onOpenShow={onOpenShow}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

export function RatedSection({
  items,
  onOpenMovie,
  onOpenShow,
}: {
  items: LibraryRatedTitle[];
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Rated</Text>
      {items.map((item) => (
        <RatedTitleRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          onOpenMovie={onOpenMovie}
          onOpenShow={onOpenShow}
        />
      ))}
    </View>
  );
}

export function MoviesSection({
  items,
  libraryAction,
  onOptimisticRemove,
  onOpenMovie,
  onOpenShowSeason,
  onRemove,
}: {
  items: RecentlyWatchedItem[];
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenMovie: (movieId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Movies</Text>
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
    </View>
  );
}

export function EpisodesSection({
  groups,
  libraryAction,
  onOptimisticRemove,
  onOpenEpisode,
  onOpenShow,
  onOpenShowSeason,
  onRemove,
}: {
  groups: EpisodeGroup[];
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenEpisode: (episodeId: string) => void;
  onOpenShow: (showId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
}) {
  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Episodes</Text>
      {groups.map((group) => (
        <EpisodeShowGroup
          group={group}
          key={group.showId}
          libraryAction={libraryAction}
          onOptimisticRemove={onOptimisticRemove}
          onOpenEpisode={onOpenEpisode}
          onOpenShow={onOpenShow}
          onOpenShowSeason={onOpenShowSeason}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

export function ChronologySection({
  chronology,
  items,
  libraryAction,
  onOptimisticRemove,
  onOpenEpisode,
  onOpenMovie,
  onOpenShowSeason,
  onRemove,
  onRetry,
}: {
  chronology: LibraryChronologyState;
  items: RecentlyWatchedItem[];
  libraryAction: LibraryActionState;
  onOptimisticRemove: (actionKey: string) => void;
  onOpenEpisode: (episodeId: string) => void;
  onOpenMovie: (movieId: string) => void;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onRemove: (item: RecentlyWatchedItem) => void;
  onRetry: () => void;
}) {
  if (chronology.kind === "loading" && items.length === 0) {
    return <LibraryRowsSkeleton />;
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
          onOpenEpisode={onOpenEpisode}
          onOpenMovie={onOpenMovie}
          onOpenShowSeason={onOpenShowSeason}
          onRemove={onRemove}
        />
      ))}
      {chronology.nextCursor ? (
        <AppText tone="muted">
          {chronology.kind === "loadingMore" ? "Loading more history..." : "Scroll for more history"}
        </AppText>
      ) : null}
    </View>
  );
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
