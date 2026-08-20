import { router } from "expo-router";

import type { AvailableDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, CalloutRow, EmptyState, MediaRowSkeleton } from "../ui";
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
        <Button label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!available) {
    return null;
  }

  return (
    <CalloutRow
      accessibilityLabel={`Open streamable titles in ${available.country}`}
      detail="Highly rated titles with streaming availability."
      eyebrow={available.country}
      icon="play-circle-outline"
      meta={<AppText tone="accent" variant="caption">{available.items.length}</AppText>}
      onPress={() => router.push("/available")}
      title="Available to stream"
      tone="accent"
    />
  );
}
