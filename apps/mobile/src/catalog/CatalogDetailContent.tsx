import { Pressable, View } from "react-native";

import type { CatalogDetailResponse, MediaType, MovieDetailResponse, ShowDetailResponse, ShowSeasonSummary } from "../api/tvlore-api";
import { AppText, Badge, Button, PosterImage, Skeleton } from "../ui";
import { styles } from "./catalog-detail-styles";
import { getTmdbPosterUrl } from "./posters";
import type { PreferenceActionState, WatchActionState, WatchlistActionState } from "./use-catalog-detail";

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
}: {
  detail: CatalogDetailResponse;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => void;
  onSetRating: (mediaType: MediaType, id: string, rating: number | null) => void;
  onSetShowWatched: (showId: string, watched: boolean) => void;
  preferenceAction: PreferenceActionState;
  watchAction: WatchActionState;
  watchlistAction: WatchlistActionState;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <PosterImage
          label={detail.mediaType === "show" ? "TV" : "M"}
          size="detail"
          uri={detail.posterPath ? getTmdbPosterUrl(detail.posterPath) : null}
        />

        <View style={styles.heroText}>
          <Badge label={detail.mediaType === "show" ? "Show" : "Movie"} />
          <AppText style={styles.title}>{detail.title}</AppText>
          <AppText tone="muted">{getMetadata(detail)}</AppText>
        </View>
      </View>

      <AppText style={styles.overview}>{detail.overview || "No overview available."}</AppText>

      <WatchlistPanel detail={detail} onSetInWatchlist={onSetInWatchlist} watchlistAction={watchlistAction} />
      <PreferencePanel detail={detail} onSetRating={onSetRating} preferenceAction={preferenceAction} />

      {detail.mediaType === "movie" ? (
        <MovieWatchPanel movie={detail} watchAction={watchAction} onSetWatched={onSetMovieWatched} />
      ) : (
        <>
          <ShowProgressPanel show={detail} watchAction={watchAction} onSetWatched={onSetShowWatched} />
          <ShowSeasonsPanel onOpenShowSeason={onOpenShowSeason} show={detail} />
        </>
      )}
    </View>
  );
}

function WatchlistPanel({
  detail,
  onSetInWatchlist,
  watchlistAction,
}: {
  detail: CatalogDetailResponse;
  onSetInWatchlist: (mediaType: MediaType, id: string, inWatchlist: boolean) => void;
  watchlistAction: WatchlistActionState;
}) {
  const isSaving = watchlistAction.kind === "loading";

  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Watchlist</AppText>
      <AppText tone="muted">
        {detail.inWatchlist ? "Saved for later." : "Save this title to watch later."}
      </AppText>
      {watchlistAction.kind === "error" ? <AppText tone="danger">{watchlistAction.message}</AppText> : null}

      <Button
        isLoading={isSaving}
        label={detail.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        loadingLabel="Saving"
        onPress={() => onSetInWatchlist(detail.mediaType, detail.id, !detail.inWatchlist)}
        variant={detail.inWatchlist ? "secondary" : "primary"}
      />
    </View>
  );
}

function PreferencePanel({
  detail,
  onSetRating,
  preferenceAction,
}: {
  detail: CatalogDetailResponse;
  onSetRating: (mediaType: MediaType, id: string, rating: number | null) => void;
  preferenceAction: PreferenceActionState;
}) {
  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Your rating</AppText>
      <AppText tone="muted">{detail.rating ? `Rated ${detail.rating}/5.` : "Rate this title for future recommendations."}</AppText>
      {preferenceAction.kind === "error" ? <AppText tone="danger">{preferenceAction.message}</AppText> : null}

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = detail.rating === rating;

          return (
            <Pressable
              key={rating}
              style={[
                styles.ratingButton,
                isSelected ? styles.ratingButtonSelected : null,
              ]}
              onPress={() => onSetRating(detail.mediaType, detail.id, rating)}
            >
              <AppText style={isSelected ? styles.ratingButtonTextSelected : styles.ratingButtonText} variant="button">
                {rating}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {detail.rating ? (
        <Button
          label="Clear rating"
          onPress={() => onSetRating(detail.mediaType, detail.id, null)}
          size="small"
          variant="secondary"
        />
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
          <Skeleton height={26} width={62} />
          <Skeleton height={34} width="84%" />
          <Skeleton height={14} width="54%" />
        </View>
      </View>

      <View style={styles.skeletonOverview}>
        <Skeleton height={15} />
        <Skeleton height={15} />
        <Skeleton height={16} width="70%" />
      </View>

      <ActionPanelSkeleton />
      <ActionPanelSkeleton />

      {mediaType === "movie" ? (
        <ActionPanelSkeleton />
      ) : (
        <>
          <ActionPanelSkeleton />
          <ShowSeasonsSkeleton />
        </>
      )}
    </View>
  );
}

function ShowProgressPanel({
  onSetWatched,
  show,
  watchAction,
}: {
  onSetWatched: (showId: string, watched: boolean) => void;
  show: ShowDetailResponse;
  watchAction: WatchActionState;
}) {
  const isSaving = watchAction.kind === "loading";
  const canUnwatch = show.progress.watchedEpisodeCount > 0;

  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Progress</AppText>
      <AppText tone="muted">{getShowProgressLine(show)}</AppText>
      {show.progress.nextEpisode ? (
        <AppText tone="muted">
          Next S{show.progress.nextEpisode.seasonNumber} E{show.progress.nextEpisode.episodeNumber} - {show.progress.nextEpisode.title}
        </AppText>
      ) : null}
      {watchAction.kind === "error" ? <AppText tone="danger">{watchAction.message}</AppText> : null}

      <View style={styles.actionRow}>
        <Button
          disabled={isSaving || show.progress.isComplete}
          isLoading={isSaving}
          label="Mark watched"
          loadingLabel="Saving"
          onPress={() => onSetWatched(show.id, true)}
          size="small"
        />

        <Button
          disabled={isSaving || !canUnwatch}
          isLoading={isSaving}
          label="Mark unwatched"
          loadingLabel="Saving"
          onPress={() => onSetWatched(show.id, false)}
          size="small"
          variant="secondary"
        />
      </View>
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

function ActionPanelSkeleton() {
  return (
    <View style={styles.skeletonPanel}>
      <Skeleton height={22} width="42%" />
      <Skeleton height={16} width="70%" />
      <Skeleton height={38} width={132} />
    </View>
  );
}

function MovieWatchPanel({
  movie,
  onSetWatched,
  watchAction,
}: {
  movie: MovieDetailResponse;
  onSetWatched: (movieId: string, watched: boolean) => void;
  watchAction: WatchActionState;
}) {
  return (
    <View style={styles.statusPanel}>
      <AppText variant="section">Watch state</AppText>
      <AppText tone="muted">{getStatusLine(movie)}</AppText>
      {movie.lastWatchedAt ? (
        <AppText tone="muted">Last watched {formatDate(movie.lastWatchedAt)}</AppText>
      ) : null}
      {watchAction.kind === "error" ? <AppText tone="danger">{watchAction.message}</AppText> : null}

      <Button
        label={movie.watched ? "Mark unwatched" : "Mark watched"}
        onPress={() => onSetWatched(movie.id, !movie.watched)}
        variant={movie.watched ? "secondary" : "primary"}
      />
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

function getStatusLine(detail: CatalogDetailResponse) {
  if (detail.mediaType === "show") {
    return `${detail.seasons.length} seasons available`;
  }

  return detail.watched ? `Watched ${formatCount(detail.watchCount, "time")}` : "Not watched yet";
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
