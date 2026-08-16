import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import type { CatalogDetailResponse, MediaType } from "../api/tvlore-api";
import { AppText, ui } from "../ui";
import { styles } from "./catalog-detail-styles";
import type { WatchActionState, WatchlistActionState } from "./use-catalog-detail";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function TitleActionRow({
  detail,
  onSetInWatchlist,
  onSetMovieWatched,
  onSetShowWatched,
  watchAction,
  watchlistAction,
}: {
  detail: CatalogDetailResponse;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => Promise<void>;
  onSetShowWatched: (showId: string, watched: boolean) => Promise<void>;
  watchAction: WatchActionState;
  watchlistAction: WatchlistActionState;
}) {
  const isWatchlistSaving = watchlistAction.kind === "loading";
  const isWatchSaving = watchAction.kind === "loading";
  const isWatched = detail.mediaType === "movie" ? detail.watched : detail.progress.isComplete;
  const canUnwatchShow = detail.mediaType === "show" && detail.progress.watchedEpisodeCount > 0;
  const canToggleWatched = detail.mediaType === "movie" || isWatched || canUnwatchShow || detail.progress.totalEpisodeCount > 0;

  return (
    <View style={styles.quickActionRow}>
      <IconActionButton
        accessibilityLabel={detail.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        icon={detail.inWatchlist ? "bookmark" : "bookmark-outline"}
        isActive={detail.inWatchlist}
        isLoading={isWatchlistSaving}
        onPress={() => onSetInWatchlist(detail.mediaType, detail.id, !detail.inWatchlist)}
      />

      <IconActionButton
        accessibilityLabel={isWatched ? "Mark unwatched" : "Mark watched"}
        disabled={!canToggleWatched}
        icon={isWatched ? "checkmark" : "close"}
        isActive={isWatched}
        isDanger={!isWatched}
        isLoading={isWatchSaving}
        onPress={() => {
          if (detail.mediaType === "movie") {
            void onSetMovieWatched(detail.id, !detail.watched);
            return;
          }

          void onSetShowWatched(detail.id, !detail.progress.isComplete);
        }}
      />
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

function IconActionButton({
  accessibilityLabel,
  disabled,
  icon,
  isActive,
  isDanger,
  isLoading,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: IconName;
  isActive?: boolean;
  isDanger?: boolean;
  isLoading?: boolean;
  onPress: () => void | Promise<void>;
}) {
  const isDisabled = disabled || isLoading;
  const iconColor = isActive ? ui.color.white : isDanger ? ui.color.dangerDark : ui.color.accent;

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
        isDanger && !isActive ? styles.iconActionButtonDanger : null,
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
