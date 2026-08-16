import { useState } from "react";
import { Text, View } from "react-native";

import type { RecommendationItem, RecommendationsResponse } from "../api/tvlore-api";
import { getTmdbPosterUrl } from "../catalog/posters";
import { Button, MediaRow } from "../ui";
import { styles } from "./home-styles";
import { getRecommendationDetail } from "./recommendation-detail";
import {
  getRecommendationActionKey,
  type RecommendationActionState,
} from "./use-recommendation-actions";

export type RecommendationsPanelProps = {
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
          preferredGenreNames={recommendations.basis.preferredGenreNames}
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
  preferredGenreNames,
  onSaveToWatchlist,
}: {
  item: RecommendationItem;
  onOpenMovie: (movieId: string) => void;
  onOpenShow: (showId: string) => void;
  preferredGenreNames: string[];
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
      <MediaRow
        detail={getRecommendationDetail(item, preferredGenreNames)}
        frame={false}
        onPress={openItem}
        posterLabel={item.mediaType === "movie" ? "M" : "TV"}
        posterUri={item.posterPath ? getTmdbPosterUrl(item.posterPath) : null}
        style={styles.recommendationMain}
        title={item.title}
      />
      <Button
        label="Save"
        onPress={() => onSaveToWatchlist(item)}
        size="small"
      />
    </View>
  );
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
