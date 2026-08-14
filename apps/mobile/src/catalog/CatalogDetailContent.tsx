import { Image, Pressable, Text, View } from "react-native";

import type { CatalogDetailResponse, MediaType, MovieDetailResponse, ShowDetailResponse, ShowSeasonSummary } from "../api/tvlore-api";
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
        {detail.posterPath ? (
          <Image source={{ uri: getTmdbPosterUrl(detail.posterPath) }} style={styles.poster} />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>{detail.mediaType === "show" ? "TV" : "M"}</Text>
          </View>
        )}

        <View style={styles.heroText}>
          <Text style={styles.mediaPill}>{detail.mediaType === "show" ? "Show" : "Movie"}</Text>
          <Text style={styles.title}>{detail.title}</Text>
          <Text style={styles.mutedText}>{getMetadata(detail)}</Text>
        </View>
      </View>

      <Text style={styles.overview}>{detail.overview || "No overview available."}</Text>

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
      <Text style={styles.statusTitle}>Watchlist</Text>
      <Text style={styles.mutedText}>
        {detail.inWatchlist ? "Saved for later." : "Save this title to watch later."}
      </Text>
      {watchlistAction.kind === "error" ? <Text style={styles.errorText}>{watchlistAction.message}</Text> : null}

      <Pressable
        disabled={isSaving}
        style={[detail.inWatchlist ? styles.secondaryButton : styles.primaryButton, isSaving ? styles.disabledButton : null]}
        onPress={() => onSetInWatchlist(detail.mediaType, detail.id, !detail.inWatchlist)}
      >
        <Text style={detail.inWatchlist ? styles.secondaryButtonText : styles.primaryButtonText}>
          {isSaving ? "Saving" : detail.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        </Text>
      </Pressable>
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
      <Text style={styles.statusTitle}>Your rating</Text>
      <Text style={styles.mutedText}>{detail.rating ? `Rated ${detail.rating}/5.` : "Rate this title for future recommendations."}</Text>
      {preferenceAction.kind === "error" ? <Text style={styles.errorText}>{preferenceAction.message}</Text> : null}

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
              <Text style={[styles.ratingButtonText, isSelected ? styles.ratingButtonTextSelected : null]}>
                {rating}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {detail.rating ? (
        <Pressable
          style={styles.clearButton}
          onPress={() => onSetRating(detail.mediaType, detail.id, null)}
        >
          <Text style={styles.clearButtonText}>Clear rating</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CatalogDetailSkeleton({ mediaType }: { mediaType: MediaType }) {
  return (
    <View style={styles.detail}>
      <View style={styles.hero}>
        <View style={styles.skeletonPoster} />
        <View style={styles.skeletonHeroText}>
          <View style={styles.skeletonPill} />
          <View style={styles.skeletonTitleBlock} />
          <View style={styles.skeletonMetaLine} />
        </View>
      </View>

      <View style={styles.skeletonOverview}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineMedium} />
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
      <Text style={styles.statusTitle}>Progress</Text>
      <Text style={styles.mutedText}>{getShowProgressLine(show)}</Text>
      {show.progress.nextEpisode ? (
        <Text style={styles.mutedText}>
          Next S{show.progress.nextEpisode.seasonNumber} E{show.progress.nextEpisode.episodeNumber} - {show.progress.nextEpisode.title}
        </Text>
      ) : null}
      {watchAction.kind === "error" ? <Text style={styles.errorText}>{watchAction.message}</Text> : null}

      <View style={styles.actionRow}>
        <Pressable
          disabled={isSaving || show.progress.isComplete}
          style={[styles.primaryButton, isSaving || show.progress.isComplete ? styles.disabledButton : null]}
          onPress={() => onSetWatched(show.id, true)}
        >
          <Text style={styles.primaryButtonText}>{isSaving ? "Saving" : "Mark watched"}</Text>
        </Pressable>

        <Pressable
          disabled={isSaving || !canUnwatch}
          style={[styles.secondaryButton, isSaving || !canUnwatch ? styles.disabledButton : null]}
          onPress={() => onSetWatched(show.id, false)}
        >
          <Text style={styles.secondaryButtonText}>{isSaving ? "Saving" : "Mark unwatched"}</Text>
        </Pressable>
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
      <Text style={styles.sectionTitle}>Seasons</Text>
      <Text style={styles.mutedText}>{getStatusLine(show)}</Text>

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
      <View style={styles.skeletonSectionTitle} />
      <View style={styles.skeletonMetaLine} />

      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonSeasonRow}>
          <View style={styles.skeletonSeasonBody}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineShort} />
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
        <Text style={styles.seasonTitle}>{season.title}</Text>
        <Text style={styles.mutedText}>
          Season {season.seasonNumber} - {formatCount(season.episodeCount, "episode")}
        </Text>
        {season.airDate ? <Text style={styles.mutedText}>{formatDate(season.airDate)}</Text> : null}
      </View>
    </Pressable>
  );
}

function ActionPanelSkeleton() {
  return (
    <View style={styles.skeletonPanel}>
      <View style={styles.skeletonSectionTitle} />
      <View style={styles.skeletonLineMedium} />
      <View style={styles.skeletonButton} />
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
      <Text style={styles.statusTitle}>Watch state</Text>
      <Text style={styles.mutedText}>{getStatusLine(movie)}</Text>
      {movie.lastWatchedAt ? (
        <Text style={styles.mutedText}>Last watched {formatDate(movie.lastWatchedAt)}</Text>
      ) : null}
      {watchAction.kind === "error" ? <Text style={styles.errorText}>{watchAction.message}</Text> : null}

      <Pressable
        style={movie.watched ? styles.secondaryButton : styles.primaryButton}
        onPress={() => onSetWatched(movie.id, !movie.watched)}
      >
        <Text style={movie.watched ? styles.secondaryButtonText : styles.primaryButtonText}>
          {movie.watched ? "Mark unwatched" : "Mark watched"}
        </Text>
      </Pressable>
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
