import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import type { CatalogDetailResponse, MediaType } from "../api/tvlore-api";
import { AppText, Button, ui } from "../ui";
import { formatDate, getShowProgressLine } from "./catalog-detail-format";
import { styles } from "./catalog-detail-styles";
import type { WatchActionState, WatchlistActionState } from "./use-catalog-detail";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function TitleSaveAction({
  detail,
  onSetInWatchlist,
  watchlistAction,
}: {
  detail: CatalogDetailResponse;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  watchlistAction: WatchlistActionState;
}) {
  const isWatchlistSaving = watchlistAction.kind === "loading";

  return (
    <View style={styles.quickActionRow}>
      <IconActionButton
        accessibilityLabel={detail.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        icon={detail.inWatchlist ? "bookmark" : "bookmark-outline"}
        isActive={detail.inWatchlist}
        isLoading={isWatchlistSaving}
        onPress={() => onSetInWatchlist(detail.mediaType, detail.id, !detail.inWatchlist)}
      />
    </View>
  );
}

export function TitleTrackingPanel({
  detail,
  onOpenCheckIn,
  onSetMovieWatched,
  onSetShowWatched,
  watchAction,
}: {
  detail: CatalogDetailResponse;
  onOpenCheckIn: (mediaType: MediaType, id: string) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => Promise<boolean>;
  onSetShowWatched: (showId: string, watched: boolean) => Promise<boolean>;
  watchAction: WatchActionState;
}) {
  const isSaving = watchAction.kind === "loading";
  const pendingWatched = watchAction.kind === "loading" ? watchAction.watched : null;
  const isWatched = detail.mediaType === "movie" ? detail.watched : detail.progress.isComplete;
  const canUnwatch = detail.mediaType === "movie" ? detail.watched : detail.progress.watchedEpisodeCount > 0;
  const canMarkWatched = detail.mediaType === "movie" || detail.progress.totalEpisodeCount > 0;
  const markWatchedLabel = detail.mediaType === "movie" ? "Mark watched" : "Mark full show watched";
  const markUnwatchedLabel = detail.mediaType === "movie" ? "Mark unwatched" : "Mark full show unwatched";

  const markWatched = async () => {
    const saved = detail.mediaType === "movie"
      ? await onSetMovieWatched(detail.id, true)
      : await onSetShowWatched(detail.id, true);

    if (saved) {
      onOpenCheckIn(detail.mediaType, detail.id);
    }
  };

  const markUnwatched = () => {
    if (detail.mediaType === "movie") {
      void onSetMovieWatched(detail.id, false);
      return;
    }

    void onSetShowWatched(detail.id, false);
  };

  return (
    <View style={styles.statusPanel}>
      <View style={styles.panelHeaderRow}>
        <AppText variant="section">Tracking</AppText>
        <AppText tone={isWatched ? "accent" : "muted"} variant="caption">
          {isWatched ? "Watched" : "Not watched"}
        </AppText>
      </View>

      <AppText tone="muted">
        {getTrackingLine(detail)}
      </AppText>

      <View style={styles.trackingActionRow}>
        {isWatched ? (
          <Button
            disabled={isSaving}
            label="Edit check-in"
            onPress={() => onOpenCheckIn(detail.mediaType, detail.id)}
            size="small"
          />
        ) : (
          <Button
            disabled={isSaving || !canMarkWatched}
            isLoading={pendingWatched === true}
            label={canMarkWatched ? markWatchedLabel : "Open a season first"}
            loadingLabel="Saving"
            onPress={() => {
              void markWatched();
            }}
            size="small"
          />
        )}

        {canUnwatch ? (
          <Button
            disabled={isSaving}
            isLoading={pendingWatched === false}
            label={markUnwatchedLabel}
            loadingLabel="Saving"
            onPress={markUnwatched}
            size="small"
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}

export function TitleActionMessages({
  watchAction,
  watchlistAction,
}: {
  watchAction: WatchActionState;
  watchlistAction: WatchlistActionState;
}) {
  if (watchlistAction.kind !== "error" && watchAction.kind !== "error") {
    return null;
  }

  return (
    <View style={styles.actionMessageGroup}>
      {watchlistAction.kind === "error" ? <AppText tone="danger">{watchlistAction.message}</AppText> : null}
      {watchAction.kind === "error" ? <AppText tone="danger">{watchAction.message}</AppText> : null}
    </View>
  );
}

function getTrackingLine(detail: CatalogDetailResponse) {
  if (detail.mediaType === "show") {
    return getShowProgressLine(detail);
  }

  if (detail.watched && detail.lastWatchedAt) {
    return `Watched ${formatDate(detail.lastWatchedAt)}`;
  }

  return "Not in your watched history yet.";
}

function IconActionButton({
  accessibilityLabel,
  disabled,
  icon,
  isActive,
  isLoading,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: IconName;
  isActive?: boolean;
  isLoading?: boolean;
  onPress: () => void | Promise<void>;
}) {
  const isDisabled = disabled || isLoading;
  const iconColor = isActive ? ui.color.white : ui.color.accent;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, selected: isActive }}
      disabled={isDisabled}
      onPress={() => {
        void onPress();
      }}
      style={({ pressed }) => [
        styles.iconActionButton,
        isActive ? styles.iconActionButtonActive : null,
        isDisabled ? styles.iconActionButtonDisabled : null,
        pressed ? styles.pressedSeasonRow : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <Ionicons color={iconColor} name={icon} size={24} />
      )}
    </Pressable>
  );
}
