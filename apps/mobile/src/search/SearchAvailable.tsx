import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { AvailableDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { styles } from "./search-styles";
import type { AvailableDiscoveryState } from "./use-available-discovery";

type IconName = ComponentProps<typeof Ionicons>["name"];

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
    return (
      <View style={styles.recommendationsSkeleton}>
        <Skeleton height={76} />
      </View>
    );
  }

  if (state.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Streamable titles unavailable</AppText>
        <AppText tone="muted">{state.message}</AppText>
        <Button label="Retry" onPress={onRetry} size="small" />
      </View>
    );
  }

  if (!available) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={`Open streamable titles in ${available.country}`}
      accessibilityRole="button"
      onPress={() => router.push("/available")}
      style={({ pressed }) => [styles.recommendationEntry, pressed ? styles.pressedResultRow : null]}
    >
      <View style={styles.recommendationEntryIcon}>
        <Ionicons color={ui.color.white} name={"play-circle-outline" satisfies IconName} size={24} />
      </View>

      <View style={styles.recommendationEntryText}>
        <AppText tone="accent" variant="caption">{available.country}</AppText>
        <AppText variant="section">Available to stream</AppText>
        <AppText tone="muted">Highly rated titles with streaming availability.</AppText>
      </View>

      <View style={styles.recommendationEntryMeta}>
        <AppText tone="accent" variant="caption">{available.items.length}</AppText>
        <Ionicons color={ui.color.muted} name={"chevron-forward" satisfies IconName} size={20} />
      </View>
    </Pressable>
  );
}
