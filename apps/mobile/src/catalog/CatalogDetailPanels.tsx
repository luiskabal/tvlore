import { useState } from "react";
import { Image, Linking, Pressable, View } from "react-native";

import type { CatalogDetailResponse, MediaType, ShowDetailResponse, ShowSeasonSummary, WatchProvider } from "../api/tvlore-api";
import { AppText, Badge, RatingStars, Skeleton } from "../ui";
import { styles } from "./catalog-detail-styles";
import { formatCount, formatDate, formatPublicRating, getProviderInitials, getShowProgressLine, getStatusLine } from "./catalog-detail-format";
import { getTmdbLogoUrl } from "./posters";
import type { PreferenceActionState, WatchProvidersState } from "./use-catalog-detail";
import { formatWatchCountry } from "./watch-country";

export function WhereToWatchPanel({ state }: { state: WatchProvidersState }) {
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

export function RatingMatchPanel({
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
          <RatingStars
            disabled={isSaving}
            onChange={(rating) => {
              void onSetRating(detail.mediaType, detail.id, rating);
            }}
            value={detail.rating}
          />

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

export function ShowProgressPanel({ show }: { show: ShowDetailResponse }) {
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

export function ShowSeasonsPanel({
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

function openWatchProviderLink(watchUrl: string | null) {
  if (!watchUrl) {
    return;
  }

  void Linking.openURL(watchUrl).catch(() => undefined);
}
