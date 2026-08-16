import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
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

type IconName = ComponentProps<typeof Ionicons>["name"];

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
      <View style={styles.listSection}>
        <RecommendationHeader itemCount={0} />
        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Keep rating titles</Text>
          <Text style={styles.statusDetail}>{getEmptyRecommendationText(recommendations.basis.ratedTitleCount)}</Text>
        </View>
      </View>
    );
  }
  const visibleItems = recommendations.items.filter((item) => !optimisticSavedKeys.has(getRecommendationActionKey(item)));

  return (
    <View style={styles.listSection}>
      <RecommendationHeader itemCount={visibleItems.length} />
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
