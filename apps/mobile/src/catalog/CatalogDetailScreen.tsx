import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import type { CatalogDetailResponse, MediaType, MovieDetailResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "./posters";
import { type WatchActionState, useCatalogDetail } from "./use-catalog-detail";

export default function CatalogDetailScreen({ mediaType }: { mediaType: MediaType }) {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === "string" ? params.id : null;
  const { refresh, setMovieWatched, state, watchAction } = useCatalogDetail(mediaType, id);

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
            <Text style={styles.mutedText}>Loading</Text>
          </View>
        ) : null}

        {state.kind === "error" ? (
          <View style={styles.statusPanel}>
            <Text style={styles.statusTitle}>Could not open title</Text>
            <Text style={styles.mutedText}>{state.message}</Text>
            <Pressable style={styles.primaryButton} onPress={refresh}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {state.kind === "ready" ? (
          <DetailContent
            detail={state.detail}
            watchAction={watchAction}
            onSetMovieWatched={setMovieWatched}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailContent({
  detail,
  onSetMovieWatched,
  watchAction,
}: {
  detail: CatalogDetailResponse;
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
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>Seasons</Text>
          <Text style={styles.mutedText}>{getStatusLine(detail)}</Text>
        </View>
      )}
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
  centerPanel: {
    alignItems: "center",
    borderColor: "#d8d0c5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#9c2f23",
    fontSize: 14,
    lineHeight: 20,
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
  hero: {
    flexDirection: "row",
    gap: 16,
  },
  heroText: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  mediaPill: {
    alignSelf: "flex-start",
    backgroundColor: "#e4f1ea",
    borderRadius: 8,
    color: "#1f7a5c",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  poster: {
    backgroundColor: "#d8d0c5",
    borderRadius: 8,
    height: 168,
    width: 114,
  },
  posterPlaceholder: {
    alignItems: "center",
    backgroundColor: "#e8e2d8",
    borderRadius: 8,
    height: 168,
    justifyContent: "center",
    width: 114,
  },
  posterPlaceholderText: {
    color: "#5f564d",
    fontSize: 22,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1f7a5c",
    borderRadius: 8,
    minWidth: 108,
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
  title: {
    color: "#171412",
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 36,
  },
});
