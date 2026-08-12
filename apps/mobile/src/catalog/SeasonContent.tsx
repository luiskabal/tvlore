import { Image, Pressable, Text, View } from "react-native";

import type { ShowEpisode, ShowProgressResponse, ShowSeasonDetailResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "./posters";
import { styles } from "./season-detail-styles";
import type { EpisodeWatchActionState } from "./use-season-detail";

export function SeasonContent({
  onSetEpisodeWatched,
  onSetSeasonWatched,
  season,
  showProgress,
  watchAction,
}: {
  onSetEpisodeWatched: (episodeId: string, watched: boolean) => void;
  onSetSeasonWatched: (watched: boolean) => void;
  season: ShowSeasonDetailResponse;
  showProgress: ShowProgressResponse | null;
  watchAction: EpisodeWatchActionState;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Season {season.seasonNumber}</Text>
        <Text style={styles.title}>{season.title}</Text>
        <Text style={styles.mutedText}>{getProgressText(season, showProgress)}</Text>
      </View>

      {season.overview ? <Text style={styles.overview}>{season.overview}</Text> : null}

      <SeasonBulkPanel season={season} watchAction={watchAction} onSetWatched={onSetSeasonWatched} />

      <EpisodeList
        episodes={season.episodes}
        onSetEpisodeWatched={onSetEpisodeWatched}
        watchAction={watchAction}
      />
    </View>
  );
}

function EpisodeList({
  episodes,
  onSetEpisodeWatched,
  watchAction,
}: {
  episodes: ShowEpisode[];
  onSetEpisodeWatched: (episodeId: string, watched: boolean) => void;
  watchAction: EpisodeWatchActionState;
}) {
  return (
    <View style={styles.episodeList}>
      <Text style={styles.sectionTitle}>Episodes</Text>

      {episodes.length === 0 ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>No episodes</Text>
          <Text style={styles.mutedText}>This season has no episode data yet.</Text>
        </View>
      ) : null}

      {episodes.map((episode) => (
        <EpisodeRow
          episode={episode}
          key={episode.id}
          onSetWatched={onSetEpisodeWatched}
          watchAction={watchAction}
        />
      ))}
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
  const watchedCount = season.episodes.filter((episode) => episode.watched).length;
  const episodeCount = season.episodes.length;
  const hasEpisodes = episodeCount > 0;
  const isBulkSaving = watchAction.kind === "bulk-loading";
  const isSaving = isBulkSaving || watchAction.kind === "loading";
  const allWatched = hasEpisodes && watchedCount === episodeCount;
  const noneWatched = watchedCount === 0;
  const actionError = watchAction.kind === "bulk-error" ? watchAction.message : null;

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusTitle}>Season actions</Text>
      <Text style={styles.mutedText}>{watchedCount}/{episodeCount} episodes watched</Text>
      {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

      <View style={styles.bulkButtonRow}>
        <Pressable
          disabled={!hasEpisodes || allWatched || isSaving}
          style={[styles.primaryButton, !hasEpisodes || allWatched || isSaving ? styles.disabledButton : null]}
          onPress={() => onSetWatched(true)}
        >
          <Text style={styles.primaryButtonText}>
            {isBulkSaving && watchAction.watched ? "Saving" : "Mark all watched"}
          </Text>
        </Pressable>

        <Pressable
          disabled={!hasEpisodes || noneWatched || isSaving}
          style={[styles.secondaryButton, !hasEpisodes || noneWatched || isSaving ? styles.disabledButton : null]}
          onPress={() => onSetWatched(false)}
        >
          <Text style={styles.secondaryButtonText}>
            {isBulkSaving && !watchAction.watched ? "Saving" : "Mark all unwatched"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EpisodeRow({
  episode,
  onSetWatched,
  watchAction,
}: {
  episode: ShowEpisode;
  onSetWatched: (episodeId: string, watched: boolean) => void;
  watchAction: EpisodeWatchActionState;
}) {
  const isSaving = watchAction.kind === "loading" && watchAction.episodeId === episode.id;
  const isDisabled = watchAction.kind === "loading" || watchAction.kind === "bulk-loading";
  const actionError = watchAction.kind === "error" && watchAction.episodeId === episode.id
    ? watchAction.message
    : null;

  return (
    <View style={styles.episodeRow}>
      {episode.stillPath ? (
        <Image source={{ uri: getTmdbPosterUrl(episode.stillPath) }} style={styles.still} />
      ) : (
        <View style={styles.stillPlaceholder}>
          <Text style={styles.stillPlaceholderText}>E{episode.episodeNumber}</Text>
        </View>
      )}

      <View style={styles.episodeBody}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.episodeNumber}. {episode.title}
        </Text>
        <Text style={styles.mutedText}>{getEpisodeMeta(episode)}</Text>
        <Text style={styles.episodeOverview} numberOfLines={3}>
          {episode.overview || "No overview available."}
        </Text>

        {episode.watched && episode.lastWatchedAt ? (
          <Text style={styles.watchedText}>Watched {formatDate(episode.lastWatchedAt)}</Text>
        ) : null}
        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

        <Pressable
          disabled={isDisabled}
          style={[episode.watched ? styles.secondaryButton : styles.primaryButton, isDisabled ? styles.disabledButton : null]}
          onPress={() => onSetWatched(episode.id, !episode.watched)}
        >
          <Text style={episode.watched ? styles.secondaryButtonText : styles.primaryButtonText}>
            {isSaving ? "Saving" : episode.watched ? "Mark unwatched" : "Mark watched"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getProgressText(season: ShowSeasonDetailResponse, showProgress: ShowProgressResponse | null) {
  if (showProgress) {
    return `Show progress ${showProgress.percentComplete}% - ${showProgress.watchedEpisodeCount}/${showProgress.totalEpisodeCount} episodes`;
  }

  const watchedCount = season.episodes.filter((episode) => episode.watched).length;
  return `${watchedCount}/${season.episodes.length} watched in this season`;
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
