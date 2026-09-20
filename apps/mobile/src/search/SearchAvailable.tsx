import { router } from "expo-router";

import type { AvailableDiscoveryResponse } from "../api/tvlore-api";
import { Button, EmptyState, MediaRowSkeleton } from "../ui";
import { SearchDiscoveryRail } from "./SearchDiscoveryRail";
import type { AvailableDiscoveryState } from "./use-available-discovery";

type SearchAvailableProps = {
  available: AvailableDiscoveryResponse | null;
  onRetry: () => void;
  state: AvailableDiscoveryState;
};

export function SearchAvailable({
  available,
  onRetry,
  state,
}: SearchAvailableProps) {
  if (state.kind === "loading" || state.kind === "idle") {
    return <MediaRowSkeleton lines={2} />;
  }

  if (state.kind === "error") {
    return (
      <EmptyState
        detail={state.message}
        icon="alert-circle-outline"
        title="Streamable titles unavailable"
        action={(
          <Button icon="refresh" label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!available) {
    return null;
  }

  return (
    <SearchDiscoveryRail
      accessibilityLabel={`Open streamable titles in ${available.country}`}
      count={available.items.length}
      detail="Highly rated titles with streaming availability."
      eyebrow={available.country}
      icon="play-circle-outline"
      items={available.items}
      onPress={() => router.push("/available")}
      title="Available to stream"
    />
  );
}
