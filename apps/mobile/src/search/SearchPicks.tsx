import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { TvlorePicksDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { styles } from "./search-styles";
import type { TvlorePicksState } from "./use-tvlore-picks";

type IconName = ComponentProps<typeof Ionicons>["name"];

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
    return (
      <View style={styles.recommendationsSkeleton}>
        <Skeleton height={76} />
      </View>
    );
  }

  if (state.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">TVLore Picks unavailable</AppText>
        <AppText tone="muted">{state.message}</AppText>
        <Button label="Retry" onPress={onRetry} size="small" />
      </View>
    );
  }

  if (!picks) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="Open TVLore Picks"
      accessibilityRole="button"
      onPress={() => router.push("/picks")}
      style={({ pressed }) => [styles.recommendationEntry, pressed ? styles.pressedResultRow : null]}
    >
      <View style={styles.recommendationEntryIcon}>
        <Ionicons color={ui.color.white} name={"star-outline" satisfies IconName} size={24} />
      </View>

      <View style={styles.recommendationEntryText}>
        <AppText tone="accent" variant="caption">TVLore</AppText>
        <AppText variant="section">Picks de la casa</AppText>
        <AppText tone="muted">Curated titles worth opening.</AppText>
      </View>

      <View style={styles.recommendationEntryMeta}>
        <AppText tone="accent" variant="caption">{picks.items.length}</AppText>
        <Ionicons color={ui.color.muted} name={"chevron-forward" satisfies IconName} size={20} />
      </View>
    </Pressable>
  );
}
