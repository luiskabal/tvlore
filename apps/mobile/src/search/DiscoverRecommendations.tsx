import { View } from "react-native";

import { RecommendationsPanel, type RecommendationsPanelProps } from "../home/RecommendationsPanel";
import { AppText, Button, Skeleton } from "../ui";
import { styles } from "./search-styles";
import type { DiscoverRecommendationsState } from "./use-discover-recommendations";

type DiscoverRecommendationsProps = RecommendationsPanelProps & {
  onRetry: () => void;
  state: DiscoverRecommendationsState;
};

export function DiscoverRecommendations({
  onRetry,
  state,
  ...recommendationsProps
}: DiscoverRecommendationsProps) {
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

  if (!recommendationsProps.recommendations) {
    return null;
  }

  return <RecommendationsPanel {...recommendationsProps} />;
}
