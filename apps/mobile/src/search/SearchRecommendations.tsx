import { router } from "expo-router";

import type { RecommendationsResponse } from "../api/tvlore-api";
import { Button, EmptyState, MediaRowSkeleton } from "../ui";
import { SearchDiscoveryRail } from "./SearchDiscoveryRail";
import type { SearchRecommendationsState } from "./use-search-recommendations";

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
      <>
        <MediaRowSkeleton lines={2} />
        <MediaRowSkeleton lines={2} />
      </>
    );
  }

  if (state.kind === "error") {
    return (
      <EmptyState
        detail={state.message}
        icon="alert-circle-outline"
        title="Recommendations unavailable"
        action={(
          <Button icon="refresh" label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <SearchDiscoveryRail
      accessibilityLabel="Open recommended picks"
      count={recommendations.items.length}
      detail="Open your personalized suggestions."
      eyebrow="For you"
      icon="sparkles-outline"
      items={recommendations.items}
      onPress={() => router.push("/recommendations")}
      title="Recommended picks"
    />
  );
}
