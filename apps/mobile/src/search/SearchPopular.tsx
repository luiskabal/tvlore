import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { PopularDiscoveryResponse } from "../api/tvlore-api";
import { AppText, Button, Skeleton, ui } from "../ui";
import { styles } from "./search-styles";
import type { PopularDiscoveryState } from "./use-popular-discovery";

type IconName = ComponentProps<typeof Ionicons>["name"];

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
    return (
      <View style={styles.recommendationsSkeleton}>
        <Skeleton height={76} />
      </View>
    );
  }

  if (state.kind === "error") {
    return (
      <View style={styles.statusPanel}>
        <AppText variant="section">Popular titles unavailable</AppText>
        <AppText tone="muted">{state.message}</AppText>
        <Button label="Retry" onPress={onRetry} size="small" />
      </View>
    );
  }

  if (!popular) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={`Open popular titles in ${popular.country}`}
      accessibilityRole="button"
      onPress={() => router.push("/popular")}
      style={({ pressed }) => [styles.recommendationEntry, pressed ? styles.pressedResultRow : null]}
    >
      <View style={styles.recommendationEntryIcon}>
        <Ionicons color={ui.color.white} name={"trending-up-outline" satisfies IconName} size={24} />
      </View>

      <View style={styles.recommendationEntryText}>
        <AppText tone="accent" variant="caption">{popular.country}</AppText>
        <AppText variant="section">Popular in your country</AppText>
        <AppText tone="muted">Streaming-aware titles around your saved country.</AppText>
      </View>

      <View style={styles.recommendationEntryMeta}>
        <AppText tone="accent" variant="caption">{popular.items.length}</AppText>
        <Ionicons color={ui.color.muted} name={"chevron-forward" satisfies IconName} size={20} />
      </View>
    </Pressable>
  );
}
