import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { EpisodeDetailResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton } from "../ui";
import { getTmdbPosterUrl } from "./posters";
import { styles } from "./episode-detail-styles";
import type { EpisodeDetailWatchActionState } from "./use-episode-detail";
import { useEpisodeDetail } from "./use-episode-detail";

export default function EpisodeDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const episodeId = typeof params.id === "string" ? params.id : null;
  const { refresh, setWatched, state, watchAction } = useEpisodeDetail(episodeId);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <AppText style={styles.backButtonText}>Back</AppText>
        </Pressable>

        {state.kind === "loading" ? <EpisodeDetailSkeleton /> : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <AppText variant="section">Could not open episode</AppText>
            <AppText tone="muted">{state.message}</AppText>
            <Button label="Retry" onPress={refresh} />
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <EpisodeDetailContent
            detail={state.detail}
            onSetWatched={setWatched}
            watchAction={watchAction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function EpisodeDetailContent({
  detail,
  onSetWatched,
  watchAction,
}: {
  detail: EpisodeDetailResponse;
  onSetWatched: (watched: boolean) => void;
  watchAction: EpisodeDetailWatchActionState;
}) {
  const isSaving = watchAction.kind === "loading";

  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        {detail.stillPath ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: getTmdbPosterUrl(detail.stillPath) }}
            style={styles.still}
          />
        ) : (
          <View style={styles.stillPlaceholder}>
            <AppText tone="muted" variant="caption">S{detail.seasonNumber} E{detail.episodeNumber}</AppText>
          </View>
        )}

        <View style={styles.heroText}>
          <AppText style={styles.kicker}>{detail.showTitle}</AppText>
          <AppText style={styles.title}>{detail.title}</AppText>
          <AppText tone="muted">{getEpisodeMeta(detail)}</AppText>
        </View>
      </View>

      <AppText style={styles.overview}>{detail.overview || "No overview available."}</AppText>

      <View style={styles.statusPanel}>
        <AppText variant="section">Tracking</AppText>
        <AppText tone="muted">
          {detail.watched && detail.lastWatchedAt ? `Watched ${formatDate(detail.lastWatchedAt)}` : "Not watched yet"}
        </AppText>
        {watchAction.kind === "error" ? <AppText tone="danger">{watchAction.message}</AppText> : null}
        <Button
          isLoading={isSaving}
          label={detail.watched ? "Mark unwatched" : "Mark watched"}
          loadingLabel="Saving"
          onPress={() => onSetWatched(!detail.watched)}
          variant={detail.watched ? "secondary" : "primary"}
        />
      </View>
    </View>
  );
}

function EpisodeDetailSkeleton() {
  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <Skeleton height={132} width={198} />
        <View style={styles.heroText}>
          <Skeleton height={14} width={120} />
          <Skeleton height={34} width="84%" />
          <Skeleton height={15} width="58%" />
        </View>
      </View>

      <View style={styles.skeletonOverview}>
        <Skeleton height={15} />
        <Skeleton height={15} />
        <Skeleton height={15} width="64%" />
      </View>

      <View style={styles.statusPanel}>
        <Skeleton height={22} width="36%" />
        <Skeleton height={16} width="62%" />
        <Skeleton height={44} width="100%" />
      </View>
    </View>
  );
}

function getEpisodeMeta(detail: EpisodeDetailResponse) {
  const parts = [`${detail.seasonTitle} - S${detail.seasonNumber} E${detail.episodeNumber}`];

  if (detail.runtimeMinutes) {
    parts.push(`${detail.runtimeMinutes} min`);
  }

  if (detail.airDate) {
    parts.push(formatDate(detail.airDate));
  }

  return parts.join(" - ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
