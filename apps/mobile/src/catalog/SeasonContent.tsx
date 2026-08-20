import { Pressable, View } from "react-native";

import type { ShowEpisode, ShowProgressResponse, ShowSeasonDetailResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton, StillImage } from "../ui";
import { getTmdbPosterUrl } from "./posters";
import { styles } from "./season-detail-styles";
import type { EpisodeWatchActionState } from "./use-season-detail";

export function SeasonContent({
  episodeLoadError,
  isHydratingEpisodes,
  isLoadingMoreEpisodes,
  onLoadMoreEpisodes,
  onSetEpisodeWatched,
  onSetSeasonWatched,
  onOpenEpisode,
  onOpenShow,
  season,
  showProgress,
  watchAction,
}: {
  episodeLoadError: string | null;
  isHydratingEpisodes: boolean;
  isLoadingMoreEpisodes: boolean;
  onLoadMoreEpisodes: () => void;
  onSetEpisodeWatched: (episodeId: string, watched: boolean) => void;
  onSetSeasonWatched: (watched: boolean) => void;
  onOpenEpisode: (episodeId: string) => void;
  onOpenShow: (showId: string) => void;
  season: ShowSeasonDetailResponse;
  showProgress: ShowProgressResponse | null;
  watchAction: EpisodeWatchActionState;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={`Open ${season.showTitle}`}
          accessibilityRole="button"
          onPress={() => onOpenShow(season.showId)}
          style={({ pressed }) => [styles.showLink, pressed ? styles.pressedEpisodeRow : null]}
        >
          <AppText style={styles.showLinkText}>{season.showTitle}</AppText>
        </Pressable>
        <AppText style={styles.title}>{season.title}</AppText>
        <AppText tone="muted">{getSeasonMeta(season, showProgress)}</AppText>
      </View>

      {season.overview ? <AppText style={styles.overview}>{season.overview}</AppText> : null}

      <SeasonBulkPanel season={season} watchAction={watchAction} onSetWatched={onSetSeasonWatched} />

      <EpisodeList
        episodeLoadError={episodeLoadError}
        episodes={season.episodes}
        hasMore={season.episodePage.hasMore}
        isHydratingEpisodes={isHydratingEpisodes}
        isLoadingMoreEpisodes={isLoadingMoreEpisodes}
        onLoadMoreEpisodes={onLoadMoreEpisodes}
        onOpenEpisode={onOpenEpisode}
        onSetEpisodeWatched={onSetEpisodeWatched}
        watchAction={watchAction}
      />
    </View>
  );
}

export function SeasonDetailSkeleton() {
  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <Skeleton height={20} width="48%" />
        <Skeleton height={36} width="82%" />
        <Skeleton height={16} width="70%" />
      </View>

      <View style={styles.skeletonOverview}>
        <Skeleton height={15} />
        <Skeleton height={15} />
        <Skeleton height={14} width="46%" />
      </View>

      <View style={styles.skeletonPanel}>
        <Skeleton height={22} width="42%" />
        <Skeleton height={16} width="70%" />
        <View style={styles.bulkButtonRow}>
          <Skeleton height={38} width={132} />
          <Skeleton height={38} width={132} />
        </View>
      </View>

      <View style={styles.episodeList}>
        <Skeleton height={22} width="42%" />
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.skeletonEpisodeRow}>
            <Skeleton height={64} width={96} />
            <View style={styles.skeletonEpisodeBody}>
              <Skeleton height={16} width="70%" />
              <Skeleton height={14} width="46%" />
              <Skeleton height={15} />
              <Skeleton height={38} width={132} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function EpisodeList({
  episodeLoadError,
  episodes,
  hasMore,
  isHydratingEpisodes,
  isLoadingMoreEpisodes,
  onLoadMoreEpisodes,
  onOpenEpisode,
  onSetEpisodeWatched,
  watchAction,
}: {
  episodeLoadError: string | null;
  episodes: ShowEpisode[];
  hasMore: boolean;
  isHydratingEpisodes: boolean;
  isLoadingMoreEpisodes: boolean;
  onLoadMoreEpisodes: () => void;
  onOpenEpisode: (episodeId: string) => void;
  onSetEpisodeWatched: (episodeId: string, watched: boolean) => void;
  watchAction: EpisodeWatchActionState;
}) {
  return (
    <View style={styles.episodeList}>
      <AppText style={styles.sectionTitle} variant="section">Episodes</AppText>

      {episodeLoadError ? <AppText tone="danger">{episodeLoadError}</AppText> : null}

      {episodes.length === 0 && !isHydratingEpisodes ? (
        <View style={styles.statusPanel}>
          <AppText variant="section">No episodes</AppText>
          <AppText tone="muted">This season has no episode data yet.</AppText>
        </View>
      ) : null}

      {episodes.map((episode) => (
        <EpisodeRow
          episode={episode}
          key={episode.id}
          onOpenEpisode={onOpenEpisode}
          onSetWatched={onSetEpisodeWatched}
          watchAction={watchAction}
        />
      ))}

      {isHydratingEpisodes || isLoadingMoreEpisodes ? <EpisodeRowsSkeleton count={isHydratingEpisodes ? 3 : 1} /> : null}

      {hasMore && !isHydratingEpisodes ? (
        <Button
          disabled={isLoadingMoreEpisodes}
          isLoading={isLoadingMoreEpisodes}
          label="Load more episodes"
          loadingLabel="Loading"
          onPress={onLoadMoreEpisodes}
          size="small"
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

function SeasonBulkPanel({
  onSetWatched,
  season,
  watchAction,
}: {
  onSetWatched: (watched: boolean) => void;
  season: ShowSeasonDetailResponse;
  watchAction: EpisodeWatchActionState;
}) {
  const watchedCount = season.episodePage.watchedCount;
  const episodeCount = season.episodePage.totalCount;
  const hasEpisodes = episodeCount > 0;
  const isBulkSaving = watchAction.kind === "bulk-loading";
  const allWatched = hasEpisodes && watchedCount === episodeCount;
  const noneWatched = watchedCount === 0;
  const actionError = watchAction.kind === "bulk-error" ? watchAction.message : null;

  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Season actions</AppText>
      <AppText tone="muted">{watchedCount}/{episodeCount} episodes watched</AppText>
      {actionError ? <AppText tone="danger">{actionError}</AppText> : null}

      <View style={styles.bulkButtonRow}>
        <Button
          disabled={!hasEpisodes || allWatched || isBulkSaving}
          isLoading={isBulkSaving && watchAction.watched}
          label="Mark all watched"
          loadingLabel="Saving"
          onPress={() => onSetWatched(true)}
          size="small"
        />

        <Button
          disabled={!hasEpisodes || noneWatched || isBulkSaving}
          isLoading={isBulkSaving && !watchAction.watched}
          label="Mark all unwatched"
          loadingLabel="Saving"
          onPress={() => onSetWatched(false)}
          size="small"
          variant="secondary"
        />
      </View>
    </View>
  );
}

function EpisodeRow({
  episode,
  onOpenEpisode,
  onSetWatched,
  watchAction,
}: {
  episode: ShowEpisode;
  onOpenEpisode: (episodeId: string) => void;
  onSetWatched: (episodeId: string, watched: boolean) => void;
  watchAction: EpisodeWatchActionState;
}) {
  const isDisabled = watchAction.kind === "bulk-loading";
  const actionError = watchAction.kind === "error" && watchAction.episodeId === episode.id
    ? watchAction.message
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpenEpisode(episode.id)}
      style={({ pressed }) => [styles.episodeRow, pressed ? styles.pressedEpisodeRow : null]}
    >
      <StillImage
        label={`E${episode.episodeNumber}`}
        uri={episode.stillPath ? getTmdbPosterUrl(episode.stillPath) : null}
      />

      <View style={styles.episodeBody}>
        <AppText numberOfLines={2} style={styles.episodeTitle} variant="title">
          {episode.episodeNumber}. {episode.title}
        </AppText>
        <AppText tone="muted">{getEpisodeMeta(episode)}</AppText>
        <AppText numberOfLines={3} style={styles.episodeOverview} tone="muted">
          {episode.overview || "No overview available."}
        </AppText>

        {episode.watched && episode.lastWatchedAt ? (
          <AppText tone="accent" variant="caption">Watched {formatDate(episode.lastWatchedAt)}</AppText>
        ) : null}
        {actionError ? <AppText tone="danger">{actionError}</AppText> : null}

        <Button
          disabled={isDisabled}
          label={episode.watched ? "Mark unwatched" : "Mark watched"}
          onPress={() => onSetWatched(episode.id, !episode.watched)}
          size="small"
          variant={episode.watched ? "secondary" : "primary"}
        />
      </View>
    </Pressable>
  );
}

function getProgressText(season: ShowSeasonDetailResponse, showProgress: ShowProgressResponse | null) {
  if (showProgress) {
    return `Show progress ${showProgress.percentComplete}% - ${showProgress.watchedEpisodeCount}/${showProgress.totalEpisodeCount} episodes`;
  }

  return `${season.episodePage.watchedCount}/${season.episodePage.totalCount} watched in this season`;
}

function getSeasonMeta(season: ShowSeasonDetailResponse, showProgress: ShowProgressResponse | null) {
  const progressText = getProgressText(season, showProgress);
  const defaultTitle = `Season ${season.seasonNumber}`;

  return season.title.toLowerCase() === defaultTitle.toLowerCase()
    ? progressText
    : `${defaultTitle} - ${progressText}`;
}

function getEpisodeMeta(episode: ShowEpisode) {
  const parts = [`S${episode.seasonNumber} E${episode.episodeNumber}`];

  if (episode.runtimeMinutes) {
    parts.push(`${episode.runtimeMinutes} min`);
  }

  if (episode.airDate) {
    parts.push(formatDate(episode.airDate));
  }

  return parts.join(" - ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function EpisodeRowsSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.skeletonEpisodeRow}>
          <Skeleton height={64} width={96} />
          <View style={styles.skeletonEpisodeBody}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="46%" />
            <Skeleton height={15} />
            <Skeleton height={38} width={132} />
          </View>
        </View>
      ))}
    </>
  );
}
