import { router } from "expo-router";

import type { TvlorePicksDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, CalloutRow, EmptyState, MediaRowSkeleton } from "../ui";
import type { TvlorePicksState } from "./use-tvlore-picks";

type SearchPicksProps = {
  onRetry: () => void;
  picks: TvlorePicksDiscoveryResponse | null;
  state: TvlorePicksState;
};

export function SearchPicks({
  onRetry,
  picks,
  state,
}: SearchPicksProps) {
  if (state.kind === "loading" || state.kind === "idle") {
    return <MediaRowSkeleton lines={2} />;
  }

  if (state.kind === "error") {
    return (
      <EmptyState
        detail={state.message}
        icon="alert-circle-outline"
        title="TVLore Picks unavailable"
        action={(
        <Button label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!picks) {
    return null;
  }

  return (
    <CalloutRow
      accessibilityLabel="Open TVLore Picks"
      detail="Curated titles worth opening."
      eyebrow="TVLore"
      icon="star-outline"
      meta={<AppText tone="accent" variant="caption">{picks.items.length}</AppText>}
      onPress={() => router.push("/picks")}
      title="Picks de la casa"
      tone="accent"
    />
  );
}
