import { Image, Pressable, Text, View } from "react-native";

import type { CatalogDetailResponse, MovieDetailResponse, ShowDetailResponse, ShowSeasonSummary } from "../api/tvlore-api";
import { styles } from "./catalog-detail-styles";
import { getTmdbPosterUrl } from "./posters";
import type { WatchActionState } from "./use-catalog-detail";

export function CatalogDetailContent({
  detail,
  onOpenShowSeason,
  onSetMovieWatched,
  watchAction,
}: {
  detail: CatalogDetailResponse;
  onOpenShowSeason: (showId: string, seasonNumber: number) => void;
  onSetMovieWatched: (movieId: string, watched: boolean) => void;
  watchAction: WatchActionState;
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

      {detail.mediaType === "movie" ? (
        <MovieWatchPanel movie={detail} watchAction={watchAction} onSetWatched={onSetMovieWatched} />
      ) : (
        <ShowSeasonsPanel onOpenShowSeason={onOpenShowSeason} show={detail} />
      )}
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
      style={styles.seasonRow}
      onPress={() => onOpenShowSeason(showId, season.seasonNumber)}
    >
      <View style={styles.seasonBody}>
        <Text style={styles.seasonTitle}>{season.title}</Text>
        <Text style={styles.mutedText}>
          Season {season.seasonNumber} - {formatCount(season.episodeCount, "episode")}
        </Text>
        {season.airDate ? <Text style={styles.mutedText}>{formatDate(season.airDate)}</Text> : null}
      </View>
      <Text style={styles.openText}>Open</Text>
    </Pressable>
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
  const isSaving = watchAction.kind === "loading";

  return (
    <View style={styles.statusPanel}>
      <Text style={styles.statusTitle}>Watch state</Text>
      <Text style={styles.mutedText}>{getStatusLine(movie)}</Text>
      {movie.lastWatchedAt ? (
        <Text style={styles.mutedText}>Last watched {formatDate(movie.lastWatchedAt)}</Text>
      ) : null}
      {watchAction.kind === "error" ? <Text style={styles.errorText}>{watchAction.message}</Text> : null}

      <Pressable
        disabled={isSaving}
        style={[movie.watched ? styles.secondaryButton : styles.primaryButton, isSaving ? styles.disabledButton : null]}
        onPress={() => onSetWatched(movie.id, !movie.watched)}
      >
        <Text style={movie.watched ? styles.secondaryButtonText : styles.primaryButtonText}>
          {isSaving ? "Saving" : movie.watched ? "Mark unwatched" : "Mark watched"}
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCount(value: number, label: string) {
  return `${value} ${value === 1 ? label : `${label}s`}`;
}
