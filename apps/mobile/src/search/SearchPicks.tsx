import { router } from "expo-router";

import type { TvlorePicksDiscoveryResponse } from "../api/tvlore-api";
import { Button, EmptyState, MediaRowSkeleton } from "../ui";
import { SearchDiscoveryRail } from "./SearchDiscoveryRail";
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
          <Button icon="refresh" label="Retry" onPress={onRetry} size="small" />
        )}
      />
    );
  }

  if (!picks) {
    return null;
  }

  return (
    <SearchDiscoveryRail
      accessibilityLabel="Open TVLore Picks"
      count={picks.items.length}
      detail="Curated titles worth opening."
      eyebrow="TVLore"
      icon="star-outline"
      items={picks.items}
      onPress={() => router.push("/picks")}
      title="Picks de la casa"
    />
  );
}
