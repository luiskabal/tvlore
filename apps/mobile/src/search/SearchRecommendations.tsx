import { router } from "expo-router";

import type { RecommendationsResponse } from "../api/tvlore-api";
import { AppText, Button, CalloutRow, EmptyState, MediaRowSkeleton } from "../ui";
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
        <Button label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <CalloutRow
      accessibilityLabel="Open recommended picks"
      detail="Open your personalized suggestions."
      eyebrow="For you"
      icon="sparkles-outline"
      meta={<AppText tone="accent" variant="caption">{recommendations.items.length}</AppText>}
      onPress={() => router.push("/recommendations")}
      title="Recommended picks"
      tone="accent"
    />
  );
}
