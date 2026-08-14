import { Image, Pressable, Text, View } from "react-native";

import type { RecommendationItem, RecommendationsResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { styles } from "./home-styles";

type RecommendationsPanelProps = {
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  recommendations: RecommendationsResponse | null;
};

export function RecommendationsPanel({
  onOpenMovie,
  onOpenShow,
  recommendations,
}: RecommendationsPanelProps) {
  if (!recommendations) {
    return null;
  }

  if (recommendations.items.length === 0) {
    return (
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Recommendations</Text>
        <Text style={styles.statusDetail}>{getEmptyRecommendationText(recommendations.basis.ratedTitleCount)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Recommended for you</Text>
      {recommendations.items.map((item) => (
        <RecommendationRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          onOpenMovie={onOpenMovie}
          onOpenShow={onOpenShow}
        />
      ))}
    </View>
  );
}

function RecommendationRow({
  item,
  onOpenMovie,
  onOpenShow,
}: {
  item: RecommendationItem;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
}) {
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShow(item.id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={openItem}
      style={({ pressed }) => [styles.listItem, pressed ? styles.pressedListItem : null]}
    >
      <RecommendationPoster label={item.mediaType === "movie" ? "M" : "TV"} posterPath={item.posterPath} />
      <View style={styles.listText}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.statusDetail}>{getReasonText(item.reason)}</Text>
      </View>
      <Text style={styles.progressText}>{item.mediaType === "movie" ? "Movie" : "Show"}</Text>
    </Pressable>
  );
}

function RecommendationPoster({ label, posterPath }: { label: string; posterPath: string | null }) {
  if (posterPath) {
    return <Image source={{ uri: getTmdbPosterUrl(posterPath) }} style={styles.libraryPoster} />;
  }

  return (
    <View style={styles.libraryPosterPlaceholder}>
      <Text style={styles.libraryPosterPlaceholderText}>{label}</Text>
    </View>
  );
}

function getReasonText(reason: RecommendationItem["reason"]) {
  if (reason === "based_on_movie_ratings") {
    return "Based on your movie ratings";
  }

  if (reason === "based_on_show_ratings") {
    return "Based on your show ratings";
  }

  return "From your TVLore catalog";
}

function getEmptyRecommendationText(ratedTitleCount: number) {
  return ratedTitleCount === 0
    ? "Rate a few shows or movies to unlock suggestions."
    : "Search more titles so TVLore has fresh candidates to suggest.";
}
