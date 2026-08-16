import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { RecommendationItem, RecommendationsResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { AppText, PosterImage } from "../ui";
import { styles } from "./home-styles";
import { getRecommendationDetail } from "./recommendation-detail";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type RecommendationsPanelProps = {
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
      <View style={styles.listSection}>
        <RecommendationHeader itemCount={0} />
        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Keep rating titles</Text>
          <Text style={styles.statusDetail}>{getEmptyRecommendationText(recommendations.basis.ratedTitleCount)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.listSection}>
      <RecommendationHeader itemCount={recommendations.items.length} />
      {recommendations.items.map((item) => (
        <RecommendationRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          onOpenMovie={onOpenMovie}
          preferredGenreNames={recommendations.basis.preferredGenreNames}
          onOpenShow={onOpenShow}
        />
      ))}
    </View>
  );
}

function RecommendationHeader({ itemCount }: { itemCount: number }) {
  return (
    <View style={styles.recommendationHeader}>
      <View style={styles.recommendationIconFrame}>
        <Ionicons color="#ffffff" name={"sparkles-outline" satisfies IconName} size={24} />
      </View>

      <View style={styles.recommendationHeaderText}>
        <Text style={styles.recommendationEyebrow}>For you</Text>
        <Text style={styles.recommendationTitle}>Recommended picks</Text>
        <Text style={styles.recommendationDetail}>Based on your ratings, genres, and availability country.</Text>
      </View>

      <View style={styles.recommendationCountPill}>
        <Text style={styles.recommendationCountText}>{itemCount}</Text>
      </View>
    </View>
  );
}

function RecommendationRow({
  item,
  onOpenMovie,
  onOpenShow,
  preferredGenreNames,
}: {
  item: RecommendationItem;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  preferredGenreNames: string[];
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
      accessibilityLabel={`Open ${item.title}`}
      accessibilityRole="button"
      onPress={openItem}
      style={({ pressed }) => [
        styles.recommendationListItem,
        pressed ? styles.pressedListItem : null,
      ]}
    >
      <PosterImage
        label={item.mediaType === "movie" ? "M" : "TV"}
        uri={item.posterPath ? getTmdbPosterUrl(item.posterPath) : null}
      />
      <View style={styles.recommendationText}>
        <AppText numberOfLines={2} variant="title">{item.title}</AppText>
        <AppText tone="muted">{getRecommendationDetail(item, preferredGenreNames)}</AppText>
      </View>
      <Ionicons color="#5f564d" name={"chevron-forward" satisfies IconName} size={20} />
    </Pressable>
  );
}

function getEmptyRecommendationText(ratedTitleCount: number) {
  return ratedTitleCount === 0
    ? "Rate a few shows or movies to unlock suggestions."
    : "Search more titles so TVLore has fresh candidates to suggest.";
}
