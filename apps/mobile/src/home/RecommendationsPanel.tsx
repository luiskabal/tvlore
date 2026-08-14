import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import type { RecommendationItem, RecommendationsResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { styles } from "./home-styles";
import {
  getRecommendationActionKey,
  type RecommendationActionState,
} from "./use-recommendation-actions";

type RecommendationsPanelProps = {
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onSaveToWatchlist: (item: RecommendationItem) => Promise<void>;
  recommendationAction: RecommendationActionState;
  recommendations: RecommendationsResponse | null;
};

export function RecommendationsPanel({
  onOpenMovie,
  onOpenShow,
  onSaveToWatchlist,
  recommendationAction,
  recommendations,
}: RecommendationsPanelProps) {
  const [optimisticSavedKeys, setOptimisticSavedKeys] = useState<Set<string>>(() => new Set());

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
  const visibleItems = recommendations.items.filter((item) => !optimisticSavedKeys.has(getRecommendationActionKey(item)));

  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>Recommended for you</Text>
      {recommendationAction.kind === "error" ? <Text style={styles.errorText}>{recommendationAction.message}</Text> : null}
      {visibleItems.length === 0 ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Saved</Text>
          <Text style={styles.statusDetail}>Refreshing suggestions from your watchlist.</Text>
        </View>
      ) : null}
      {visibleItems.map((item) => (
        <RecommendationRow
          item={item}
          key={`${item.mediaType}-${item.id}`}
          onOpenMovie={onOpenMovie}
          onSaveToWatchlist={(selectedItem) => {
            const actionKey = getRecommendationActionKey(selectedItem);

            setOptimisticSavedKeys((current) => addSetValue(current, actionKey));
            void onSaveToWatchlist(selectedItem).catch(() => {
              setOptimisticSavedKeys((current) => deleteSetValue(current, actionKey));
            });
          }}
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
  onSaveToWatchlist,
}: {
  item: RecommendationItem;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  onSaveToWatchlist: (item: RecommendationItem) => void;
}) {
  const openItem = () => {
    if (item.mediaType === "movie") {
      onOpenMovie(item.id);
      return;
    }

    onOpenShow(item.id);
  };

  return (
    <View style={styles.listItem}>
      <Pressable
        accessibilityRole="button"
        onPress={openItem}
        style={({ pressed }) => [styles.recommendationMain, pressed ? styles.pressedListItem : null]}
      >
        <RecommendationPoster label={item.mediaType === "movie" ? "M" : "TV"} posterPath={item.posterPath} />
        <View style={styles.listText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.statusDetail}>{getReasonText(item.reason)}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => onSaveToWatchlist(item)}
        style={({ pressed }) => [styles.smallActionButton, pressed ? styles.pressedListItem : null]}
      >
        <Text style={styles.smallActionButtonText}>Save</Text>
      </Pressable>
    </View>
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

function addSetValue(current: Set<string>, value: string) {
  const next = new Set(current);

  next.add(value);

  return next;
}

function deleteSetValue(current: Set<string>, value: string) {
  const next = new Set(current);

  next.delete(value);

  return next;
}
