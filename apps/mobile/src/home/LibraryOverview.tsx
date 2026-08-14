import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { ContinueWatchingShow, LibraryResponse, LibraryWatchlistItem, RecentlyWatchedItem } from "../api/tvlore-api";
import { styles } from "./home-styles";

type LibrarySectionFilter = "all" | "history" | "watching" | "watchlist";

const librarySections: Array<{ label: string; value: LibrarySectionFilter }> = [
  { label: "All", value: "all" },
  { label: "Watching", value: "watching" },
  { label: "Watchlist", value: "watchlist" },
  { label: "History", value: "history" },
];

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
  const [selectedSection, setSelectedSection] = useState<LibrarySectionFilter | null>(null);

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
  const hasContinueWatching = library.continueWatching.length > 0;
  const hasRecentlyWatched = library.recentlyWatched.length > 0;
  const hasWatchlist = library.watchlist.length > 0;
  const activeSection = selectedSection ?? getDefaultSection(library);
  const shouldShowWatchlist = activeSection === "all" || activeSection === "watchlist";
  const shouldShowContinueWatching = activeSection === "all" || activeSection === "watching";
  const shouldShowHistory = activeSection === "all" || activeSection === "history";

  return (
    <View style={styles.librarySectionFixed}>
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

      {!isEmpty ? (
        <LibrarySectionTabs activeSection={activeSection} onSelect={setSelectedSection} />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.libraryListContent}
        showsVerticalScrollIndicator={false}
        style={styles.libraryListScroll}
      >
        {!isEmpty && activeSection !== "all" && !hasItemsForSection(activeSection, library) ? (
          <EmptySection activeSection={activeSection} />
        ) : null}

        {shouldShowContinueWatching && hasContinueWatching ? (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Continue Watching</Text>
            {library.continueWatching.map((show) => (
              <ContinueWatchingItem key={show.id} onOpenShowSeason={onOpenShowSeason} show={show} />
            ))}
          </View>
        ) : null}

        {shouldShowWatchlist && hasWatchlist ? (
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

        {shouldShowHistory && hasRecentlyWatched ? (
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
      </ScrollView>
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

function hasItemsForSection(activeSection: LibrarySectionFilter, library: LibraryResponse) {
  if (activeSection === "watching") {
    return library.continueWatching.length > 0;
  }

  if (activeSection === "watchlist") {
    return library.watchlist.length > 0;
  }

  if (activeSection === "history") {
    return library.recentlyWatched.length > 0;
  }

  return true;
}

function getDefaultSection(library: LibraryResponse): LibrarySectionFilter {
  return library.continueWatching.length > 0 ? "watching" : "all";
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

function getEmptySectionTitle(activeSection: LibrarySectionFilter) {
  if (activeSection === "watching") {
    return "Nothing in progress";
  }

  if (activeSection === "watchlist") {
    return "No saved titles";
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

  return "Watched movies and episodes will appear here.";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
