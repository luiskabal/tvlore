import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, SafeAreaView, ScrollView, View } from "react-native";

import type { EpisodeDetailResponse, WatchReflectionInput } from "../api/tvlore-api";
import { AppText, Button, Skeleton } from "../ui";
import { getTmdbPosterUrl } from "./posters";
import type { PostWatchCastState } from "./post-watch-check-in-model";
import { styles } from "./episode-detail-styles";
import { PostWatchCheckIn, type PostWatchCheckInTarget } from "./PostWatchCheckIn";
import type { EpisodeDetailPreferenceActionState, EpisodeDetailReflectionActionState, EpisodeDetailWatchActionState } from "./use-episode-detail";
import { useEpisodeDetail } from "./use-episode-detail";

export default function EpisodeDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const episodeId = typeof params.id === "string" ? params.id : null;
  const { castState, loadCast, preferenceAction, reflectionAction, refresh, setRating, setReflection, setWatched, state, watchAction } = useEpisodeDetail(episodeId);

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
            castState={castState}
            detail={state.detail}
            onLoadCast={loadCast}
            onSetRating={setRating}
            onSetReflection={setReflection}
            onSetWatched={setWatched}
            preferenceAction={preferenceAction}
            reflectionAction={reflectionAction}
            watchAction={watchAction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function EpisodeDetailContent({
  castState,
  detail,
  onLoadCast,
  onSetRating,
  onSetReflection,
  onSetWatched,
  preferenceAction,
  reflectionAction,
  watchAction,
}: {
  castState: PostWatchCastState;
  detail: EpisodeDetailResponse;
  onLoadCast: () => void;
  onSetRating: (rating: number | null) => Promise<boolean>;
  onSetReflection: (input: WatchReflectionInput) => Promise<boolean>;
  onSetWatched: (watched: boolean) => Promise<boolean>;
  preferenceAction: EpisodeDetailPreferenceActionState;
  reflectionAction: EpisodeDetailReflectionActionState;
  watchAction: EpisodeDetailWatchActionState;
}) {
  const [checkInTarget, setCheckInTarget] = useState<PostWatchCheckInTarget | null>(null);
  const isSaving = watchAction.kind === "loading";
  const setWatched = async (watched: boolean) => {
    const saved = await onSetWatched(watched);

    if (saved && watched) {
      setCheckInTarget({
        id: detail.id,
        mediaType: "episode",
        rating: detail.rating,
        reflection: detail.reflection,
        title: `${detail.showTitle} - ${detail.title}`,
      });
    }
  };

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

      <EpisodeRatingPanel
        detail={detail}
        onSetRating={onSetRating}
        preferenceAction={preferenceAction}
      />

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
          onPress={() => {
            void setWatched(!detail.watched);
          }}
          variant={detail.watched ? "secondary" : "primary"}
        />
      </View>

      <PostWatchCheckIn
        actionState={reflectionAction}
        castState={castState}
        onClose={() => setCheckInTarget(null)}
        onLoadCast={() => onLoadCast()}
        onSave={(_mediaType, _id, input) => onSetReflection(input)}
        target={checkInTarget}
      />
    </View>
  );
}

function EpisodeRatingPanel({
  detail,
  onSetRating,
  preferenceAction,
}: {
  detail: EpisodeDetailResponse;
  onSetRating: (rating: number | null) => Promise<boolean>;
  preferenceAction: EpisodeDetailPreferenceActionState;
}) {
  const isSaving = preferenceAction.kind === "loading";

  return (
    <View style={styles.statusPanel}>
      <View style={styles.ratingHeaderRow}>
        <AppText variant="section">Your rating</AppText>
        <AppText style={styles.ratingValue} variant="title">{detail.rating ? `${detail.rating}/5` : "--"}</AppText>
      </View>

      {preferenceAction.kind === "error" ? <AppText tone="danger">{preferenceAction.message}</AppText> : null}

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = detail.rating === rating;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              key={rating}
              onPress={() => {
                void onSetRating(rating);
              }}
              style={[
                styles.ratingButton,
                isSelected ? styles.ratingButtonSelected : null,
                isSaving ? styles.disabledAction : null,
              ]}
            >
              <AppText style={isSelected ? styles.ratingButtonTextSelected : styles.ratingButtonText} variant="button">
                {rating}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {detail.rating ? (
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={() => {
            void onSetRating(null);
          }}
          style={[styles.clearRatingButton, isSaving ? styles.disabledAction : null]}
        >
          <AppText variant="caption">Clear rating</AppText>
        </Pressable>
      ) : null}
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
        <View style={styles.ratingHeaderRow}>
          <Skeleton height={22} width="36%" />
          <Skeleton height={24} width={48} />
        </View>
        <View style={styles.ratingRow}>
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton height={42} key={item} width={42} />
          ))}
        </View>
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
