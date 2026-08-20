import { router } from "expo-router";

import type { PopularDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, CalloutRow, EmptyState, MediaRowSkeleton } from "../ui";
import type { PopularDiscoveryState } from "./use-popular-discovery";

type SearchPopularProps = {
  onRetry: () => void;
  popular: PopularDiscoveryResponse | null;
  state: PopularDiscoveryState;
};

export function SearchPopular({
  onRetry,
  popular,
  state,
}: SearchPopularProps) {
  if (state.kind === "loading" || state.kind === "idle") {
    return <MediaRowSkeleton lines={2} />;
  }

  if (state.kind === "error") {
    return (
      <EmptyState
        detail={state.message}
        icon="alert-circle-outline"
        title="Popular titles unavailable"
        action={(
        <Button label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!popular) {
    return null;
  }

  return (
    <CalloutRow
      accessibilityLabel={`Open popular titles in ${popular.country}`}
      detail="Streaming-aware titles around your saved country."
      eyebrow={popular.country}
      icon="trending-up-outline"
      meta={<AppText tone="accent" variant="caption">{popular.items.length}</AppText>}
      onPress={() => router.push("/popular")}
      title="Popular in your country"
      tone="accent"
    />
  );
}
