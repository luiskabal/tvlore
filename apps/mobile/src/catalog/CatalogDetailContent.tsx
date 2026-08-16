import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, View } from "react-native";

import type { CatalogDetailResponse, MediaType, ShowDetailResponse, ShowSeasonSummary, WatchProvider } from "../api/tvlore-api";
import { AppText, Badge, PosterImage, Skeleton } from "../ui";
import { ui } from "../ui";
import { styles } from "./catalog-detail-styles";
import { formatWatchCountry } from "./watch-country";
import { getTmdbLogoUrl, getTmdbPosterUrl } from "./posters";
import { PostWatchCheckIn, type PostWatchCheckInTarget } from "./PostWatchCheckIn";
import type { PreferenceActionState, WatchActionState, WatchlistActionState, WatchProvidersState } from "./use-catalog-detail";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function CatalogDetailContent({
  detail,
  onOpenShowSeason,
  onSetInWatchlist,
  onSetMovieWatched,
  onSetRating,
  onSetShowWatched,
  preferenceAction,
  watchAction,
  watchlistAction,
  watchProvidersState,
}: {
  detail: CatalogDetailResponse;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => Promise<boolean>;
  onSetRating: (mediaType: MediaType, id: string, rating: number | null) => Promise<boolean>;
  onSetShowWatched: (showId: string, watched: boolean) => Promise<boolean>;
  preferenceAction: PreferenceActionState;
  watchAction: WatchActionState;
  watchlistAction: WatchlistActionState;
  watchProvidersState: WatchProvidersState;
}) {
  const [checkInTarget, setCheckInTarget] = useState<PostWatchCheckInTarget | null>(null);
  const openCheckIn = () => {
    setCheckInTarget({
      id: detail.id,
      mediaType: detail.mediaType,
      rating: detail.rating,
      title: detail.title,
    });
  };
  const setMovieWatched = async (movieId: string, watched: boolean) => {
    const saved = await onSetMovieWatched(movieId, watched);

    if (saved && watched) {
      openCheckIn();
    }
  };
  const setShowWatched = async (showId: string, watched: boolean) => {
    const saved = await onSetShowWatched(showId, watched);

    if (saved && watched) {
      openCheckIn();
    }
  };

  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <PosterImage
          label={detail.mediaType === "show" ? "TV" : "M"}
          size="detail"
          uri={detail.posterPath ? getTmdbPosterUrl(detail.posterPath) : null}
        />

        <View style={styles.heroText}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTitleBlock}>
              <Badge label={detail.mediaType === "show" ? "Show" : "Movie"} />
              <AppText style={styles.title}>{detail.title}</AppText>
              <AppText tone="muted">{getMetadata(detail)}</AppText>
            </View>

            <TitleActionRow
              detail={detail}
              onSetInWatchlist={onSetInWatchlist}
              onSetMovieWatched={setMovieWatched}
              onSetShowWatched={setShowWatched}
              watchAction={watchAction}
              watchlistAction={watchlistAction}
            />
          </View>
        </View>
      </View>

      <TitleActionMessages watchAction={watchAction} watchlistAction={watchlistAction} />
      <RatingMatchPanel detail={detail} onSetRating={onSetRating} preferenceAction={preferenceAction} />

      <AppText style={styles.overview}>{detail.overview || "No overview available."}</AppText>

      <WhereToWatchPanel state={watchProvidersState} />

      {detail.mediaType === "show" ? (
        <>
          <ShowProgressPanel show={detail} />
          <ShowSeasonsPanel onOpenShowSeason={onOpenShowSeason} show={detail} />
        </>
      ) : null}

      <PostWatchCheckIn
        onClose={() => setCheckInTarget(null)}
        onSetRating={onSetRating}
        preferenceAction={preferenceAction}
        target={checkInTarget}
      />
    </View>
  );
}

function TitleActionRow({
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

function TitleActionMessages({
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

function WhereToWatchPanel({ state }: { state: WatchProvidersState }) {
  if (state.kind === "loading") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Where to watch</AppText>
        <View style={styles.providerSkeletonRow}>
          <Skeleton height={54} width={54} />
          <Skeleton height={54} width={54} />
        </View>
      </View>
    );
  }

  if (state.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Where to watch</AppText>
        <AppText tone="muted">Availability is unavailable right now.</AppText>
      </View>
    );
  }

  const sections = [
    { label: "Stream", providers: state.providers.providers.stream },
    { label: "Rent", providers: state.providers.providers.rent },
    { label: "Buy", providers: state.providers.providers.buy },
    { label: "Free", providers: state.providers.providers.free },
  ].filter((section) => section.providers.length > 0);

  return (
    <View style={styles.statusPanel}>
      <View style={styles.panelHeaderRow}>
        <AppText variant="section">Where to watch</AppText>
        <Badge label={formatWatchCountry(state.providers.country)} tone="neutral" />
      </View>

      {sections.length === 0 ? (
        <AppText tone="muted">No availability found for this country.</AppText>
      ) : (
        sections.map((section) => (
          <View key={section.label} style={styles.providerSection}>
            <AppText tone="muted" variant="caption">{section.label}</AppText>
            <View style={styles.providerRow}>
              {section.providers.map((provider) => (
                <ProviderPill
                  key={`${section.label}-${provider.id}`}
                  provider={provider}
                  watchUrl={state.providers.link}
                />
              ))}
            </View>
          </View>
        ))
      )}

      <AppText tone="subtle" variant="caption">Availability data from JustWatch via TMDB.</AppText>
    </View>
  );
}

function ProviderPill({ provider, watchUrl }: { provider: WatchProvider; watchUrl: string | null }) {
  return (
    <Pressable
      accessibilityLabel={`Open ${provider.name} availability`}
      accessibilityRole="link"
      disabled={!watchUrl}
      onPress={() => openWatchProviderLink(watchUrl)}
      style={({ pressed }) => [
        styles.providerPill,
        pressed ? styles.pressedSeasonRow : null,
        !watchUrl ? styles.providerPillDisabled : null,
      ]}
    >
      {provider.logoPath ? (
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={{ uri: getTmdbLogoUrl(provider.logoPath) }}
          style={styles.providerLogo}
        />
      ) : (
        <AppText style={styles.providerFallbackText} variant="caption">{getProviderInitials(provider.name)}</AppText>
      )}
    </Pressable>
  );
}

function openWatchProviderLink(watchUrl: string | null) {
  if (!watchUrl) {
    return;
  }

  void Linking.openURL(watchUrl).catch(() => undefined);
}

function RatingMatchPanel({
  detail,
  onSetRating,
  preferenceAction,
}: {
  detail: CatalogDetailResponse;
  onSetRating: (mediaType: MediaType, id: string, rating: number | null) => Promise<boolean>;
  preferenceAction: PreferenceActionState;
}) {
  const [isPublicRatingRevealed, setPublicRatingRevealed] = useState(false);
  const [isEditingUserRating, setEditingUserRating] = useState(false);
  const shouldHidePublicRating = detail.rating === null;
  const canRevealPublicRating = shouldHidePublicRating && detail.publicRating !== null;
  const showPublicRating = !canRevealPublicRating || isPublicRatingRevealed;
  const isSaving = preferenceAction.kind === "loading";

  return (
    <View style={styles.ratingMatchSection}>
      <View style={styles.ratingCompareRow}>
        <Pressable
          accessibilityLabel={canRevealPublicRating && !isPublicRatingRevealed ? "Reveal public rating" : "Public rating"}
          accessibilityRole={canRevealPublicRating ? "button" : "text"}
          disabled={!canRevealPublicRating}
          onPress={() => setPublicRatingRevealed(true)}
          style={[
            styles.ratingMetric,
            canRevealPublicRating && !isPublicRatingRevealed ? styles.ratingMetricSpoiler : null,
          ]}
        >
          <AppText tone="muted" variant="caption">TMDB</AppText>
          <AppText style={styles.ratingMetricValue} variant="title">
            {formatPublicRating(detail.publicRating, showPublicRating)}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityLabel="Edit your rating"
          accessibilityRole="button"
          onPress={() => setEditingUserRating((value) => !value)}
          style={[styles.ratingMetric, styles.ratingMetricUser]}
        >
          <AppText tone="muted" variant="caption">You</AppText>
          <AppText style={styles.ratingMetricValue} variant="title">
            {detail.rating ? `${detail.rating}/5` : "--"}
          </AppText>
        </Pressable>
      </View>

      {preferenceAction.kind === "error" ? <AppText tone="danger">{preferenceAction.message}</AppText> : null}

      {isEditingUserRating ? (
        <View style={styles.inlineRatingEditor}>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = detail.rating === rating;

              return (
                <Pressable
                  disabled={isSaving}
                  key={rating}
                  onPress={() => {
                    void onSetRating(detail.mediaType, detail.id, rating);
                  }}
                  style={[
                    styles.ratingButton,
                    isSelected ? styles.ratingButtonSelected : null,
                    isSaving ? styles.iconActionButtonDisabled : null,
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
                void onSetRating(detail.mediaType, detail.id, null);
              }}
              style={[styles.clearRatingInlineButton, isSaving ? styles.iconActionButtonDisabled : null]}
            >
              <AppText variant="caption">Clear</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function CatalogDetailSkeleton({ mediaType }: { mediaType: MediaType }) {
  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <Skeleton height={168} width={114} />
        <View style={styles.skeletonHeroText}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTitleBlock}>
              <Skeleton height={26} width={62} />
              <Skeleton height={34} width="84%" />
              <Skeleton height={14} width="54%" />
            </View>

            <QuickActionSkeleton />
          </View>
        </View>
      </View>

      <View style={styles.skeletonOverview}>
        <Skeleton height={15} />
        <Skeleton height={15} />
        <Skeleton height={16} width="70%" />
      </View>

      <WhereToWatchSkeleton />
      <RatingPanelSkeleton />

      {mediaType === "show" ? (
        <>
          <ProgressPanelSkeleton />
          <ShowSeasonsSkeleton />
        </>
      ) : null}
    </View>
  );
}

function ShowProgressPanel({ show }: { show: ShowDetailResponse }) {
  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Progress</AppText>
      <AppText tone="muted">{getShowProgressLine(show)}</AppText>
      {show.progress.nextEpisode ? (
        <AppText tone="muted">
          Next S{show.progress.nextEpisode.seasonNumber} E{show.progress.nextEpisode.episodeNumber} - {show.progress.nextEpisode.title}
        </AppText>
      ) : null}
    </View>
  );
}

function ShowSeasonsPanel({
  onOpenShowSeason,
  show,
}: {
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  show: ShowDetailResponse;
}) {
  return (
    <View style={styles.seasonsSection}>
      <AppText style={styles.sectionTitle} variant="section">Seasons</AppText>
      <AppText tone="muted">{getStatusLine(show)}</AppText>

      {show.seasons.map((season) => (
        <SeasonRow
          key={season.id}
          onOpenShowSeason={onOpenShowSeason}
          season={season}
          showId={show.id}
        />
      ))}
    </View>
  );
}

function ShowSeasonsSkeleton() {
  return (
    <View style={styles.seasonsSection}>
      <Skeleton height={22} width="42%" />
      <Skeleton height={14} width="54%" />

      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonSeasonRow}>
          <View style={styles.skeletonSeasonBody}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="48%" />
          </View>
        </View>
      ))}
    </View>
  );
}

function SeasonRow({
  onOpenShowSeason,
  season,
  showId,
}: {
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  season: ShowSeasonSummary;
  showId: string;
}) {
  return (
    <Pressable
      onPress={() => onOpenShowSeason(showId, season.seasonNumber)}
      style={({ pressed }) => [styles.seasonRow, pressed ? styles.pressedSeasonRow : null]}
    >
      <View style={styles.seasonBody}>
        <AppText style={styles.seasonTitle} variant="title">{season.title}</AppText>
        <AppText tone="muted">
          Season {season.seasonNumber} - {formatCount(season.episodeCount, "episode")}
        </AppText>
        {season.airDate ? <AppText tone="muted">{formatDate(season.airDate)}</AppText> : null}
      </View>
    </Pressable>
  );
}

function WhereToWatchSkeleton() {
  return (
    <View style={styles.statusPanel}>
      <View style={styles.panelHeaderRow}>
        <Skeleton height={22} width="44%" />
        <Skeleton height={26} radius={999} width={42} />
      </View>
      <View style={styles.providerSection}>
        <Skeleton height={14} width={54} />
        <View style={styles.providerRow}>
          <Skeleton height={54} width={54} />
          <Skeleton height={54} width={54} />
        </View>
      </View>
      <Skeleton height={14} width="74%" />
    </View>
  );
}

function ProgressPanelSkeleton() {
  return (
    <View style={styles.statusPanel}>
      <Skeleton height={22} width="34%" />
      <Skeleton height={16} width="76%" />
      <Skeleton height={16} width="62%" />
    </View>
  );
}

function RatingPanelSkeleton() {
  return (
    <View style={styles.ratingCompareRow}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.ratingMetric}>
          <Skeleton height={12} width={44} />
          <Skeleton height={20} width={78} />
        </View>
      ))}
    </View>
  );
}

function QuickActionSkeleton() {
  return (
    <View style={styles.quickActionRow}>
      <Skeleton height={44} radius={999} width={44} />
      <Skeleton height={44} radius={999} width={44} />
    </View>
  );
}

function getMetadata(detail: CatalogDetailResponse) {
  if (detail.mediaType === "show") {
    return detail.firstAirDate ? new Date(detail.firstAirDate).getFullYear().toString() : "Unknown year";
  }

  const year = detail.releaseDate ? new Date(detail.releaseDate).getFullYear().toString() : "Unknown year";
  return detail.runtimeMinutes ? `${year} - ${detail.runtimeMinutes} min` : year;
}

function formatPublicRating(publicRating: number | null, isRevealed: boolean) {
  if (publicRating === null) {
    return "--";
  }

  if (!isRevealed) {
    return "Spoiler";
  }

  return `${publicRating.toFixed(1)}/10`;
}

function getStatusLine(show: ShowDetailResponse) {
  return `${show.seasons.length} seasons available`;
}

function getShowProgressLine(show: ShowDetailResponse) {
  if (show.progress.totalEpisodeCount === 0) {
    return "Choose a season to load episodes and start tracking.";
  }

  const countText = `${show.progress.watchedEpisodeCount}/${show.progress.totalEpisodeCount} episodes`;

  if (show.progress.status === "completed") {
    return `Completed - ${countText}`;
  }

  if (show.progress.status === "watching") {
    return `Watching - ${countText} watched (${show.progress.percentComplete}%)`;
  }

  return `Not started - ${countText}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCount(value: number, label: string) {
  return `${value} ${value === 1 ? label : `${label}s`}`;
}

function getProviderInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
