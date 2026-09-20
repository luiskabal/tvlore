import { router } from "expo-router";

import type { PopularDiscoveryResponse } from "../api/tvlore-api";
import { Button, EmptyState, MediaRowSkeleton } from "../ui";
import { SearchDiscoveryRail } from "./SearchDiscoveryRail";
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
          <Button icon="refresh" label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!popular) {
    return null;
  }

  return (
    <SearchDiscoveryRail
      accessibilityLabel={`Open popular titles in ${popular.country}`}
      count={popular.items.length}
      detail="Streaming-aware titles around your saved country."
      eyebrow={popular.country}
      icon="trending-up-outline"
      items={popular.items}
      onPress={() => router.push("/popular")}
      title="Popular in your country"
    />
  );
}
