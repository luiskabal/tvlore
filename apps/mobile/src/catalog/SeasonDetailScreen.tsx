import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import type { ShowEpisode, ShowProgressResponse, ShowSeasonDetailResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "./posters";
import { type EpisodeWatchActionState, useSeasonDetail } from "./use-season-detail";

export default function SeasonDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; seasonNumber?: string | string[] }>();
  const showId = typeof params.id === "string" ? params.id : null;
  const seasonNumber = typeof params.seasonNumber === "string" ? parseSeasonNumber(params.seasonNumber) : null;
  const { refresh, setEpisodeWatched, setSeasonWatched, state, watchAction } = useSeasonDetail(showId, seasonNumber);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {state.kind === "loading" ? (
          <View style={styles.centerPanel}>
            <ActivityIndicator color="#1f7a5c" />
            <Text style={styles.mutedText}>Loading season</Text>
          </View>
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>Could not open season</Text>
            <Text style={styles.mutedText}>{state.message}</Text>
            <Pressable style={styles.primaryButton} onPress={refresh}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <SeasonContent
            season={state.detail}
            showProgress={state.showProgress}
            watchAction={watchAction}
            onSetEpisodeWatched={setEpisodeWatched}
            onSetSeasonWatched={setSeasonWatched}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SeasonContent({
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

      <View style={styles.episodeList}>
        <Text style={styles.sectionTitle}>Episodes</Text>

        {season.episodes.length === 0 ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>No episodes</Text>
            <Text style={styles.mutedText}>This season has no episode data yet.</Text>
          </View>
        ) : null}

        {season.episodes.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            watchAction={watchAction}
            onSetWatched={onSetEpisodeWatched}
          />
        ))}
      </View>
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

function parseSeasonNumber(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
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

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backButtonText: {
    color: "#1f7a5c",
    fontSize: 16,
    fontWeight: "800",
  },
  bulkButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  centerPanel: {
    alignItems: "center",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
    paddingTop: 48,
  },
  detail: {
    gap: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  episodeBody: {
    flex: 1,
    gap: 7,
  },
  episodeList: {
    gap: 12,
  },
  episodeOverview: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 19,
  },
  episodeRow: {
    backgroundColor: "#fffdfa",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  episodeTitle: {
    color: "#171412",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  errorText: {
    color: "#9c2f23",
    fontSize: 14,
    lineHeight: 20,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#1f7a5c",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  mutedText: {
    color: "#5f564d",
    fontSize: 14,
    lineHeight: 20,
  },
  overview: {
    color: "#302b27",
    fontSize: 16,
    lineHeight: 23,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1f7a5c",
    borderRadius: 8,
    minWidth: 118,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  screen: {
    backgroundColor: "#f7f4ee",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#171412",
    borderRadius: 8,
    minWidth: 136,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#171412",
    fontSize: 20,
    fontWeight: "800",
  },
  statusPanel: {
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  statusTitle: {
    color: "#171412",
    fontSize: 18,
    fontWeight: "800",
  },
  still: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 64,
    width: 96,
  },
  stillPlaceholder: {
    alignItems: "center",
    backgroundColor: "#e8e2d8",
    borderRadius: 8,
    height: 64,
    justifyContent: "center",
    width: 96,
  },
  stillPlaceholderText: {
    color: "#5f564d",
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    color: "#171412",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
  },
  watchedText: {
    color: "#1f7a5c",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
});
