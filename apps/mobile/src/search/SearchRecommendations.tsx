import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { RecommendationsResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton } from "../ui";
import { ui } from "../ui";
import { styles } from "./search-styles";
import type { SearchRecommendationsState } from "./use-search-recommendations";

type IconName = ComponentProps<typeof Ionicons>["name"];

type SearchRecommendationsProps = {
  onRetry: () => void;
  recommendations: RecommendationsResponse | null;
  state: SearchRecommendationsState;
};

export function SearchRecommendations({
  onRetry,
  recommendations,
  state,
}: SearchRecommendationsProps) {
  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <View style={styles.recommendationsSkeleton}>
        <Skeleton height={24} width="54%" />
        <Skeleton height={76} />
        <Skeleton height={76} />
      </View>
    );
  }

  if (state.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Recommendations unavailable</AppText>
        <AppText tone="muted">{state.message}</AppText>
        <Button label="Retry" onPress={onRetry} size="small" />
      </View>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="Open recommended picks"
      accessibilityRole="button"
      onPress={() => router.push("/recommendations")}
      style={({ pressed }) => [styles.recommendationEntry, pressed ? styles.pressedResultRow : null]}
    >
      <View style={styles.recommendationEntryIcon}>
        <Ionicons color={ui.color.white} name={"sparkles-outline" satisfies IconName} size={24} />
      </View>

      <View style={styles.recommendationEntryText}>
        <AppText tone="accent" variant="caption">For you</AppText>
        <AppText variant="section">Recommended picks</AppText>
        <AppText tone="muted">Open your personalized suggestions.</AppText>
      </View>

      <View style={styles.recommendationEntryMeta}>
        <AppText tone="accent" variant="caption">{recommendations.items.length}</AppText>
        <Ionicons color={ui.color.muted} name={"chevron-forward" satisfies IconName} size={20} />
      </View>
    </Pressable>
  );
}
