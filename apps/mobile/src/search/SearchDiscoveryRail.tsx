import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import type { MediaType } from "../api/tvlore-api";
import { AppText, PosterImage, ui } from "../ui";
import { getTmdbPosterUrl } from "../catalog/posters";
import { styles } from "./search-styles";

type IconName = ComponentProps<typeof Ionicons>["name"];

type SearchDiscoveryRailItem = {
  mediaType: MediaType;
  posterPath: string | null;
  title: string;
};

type SearchDiscoveryRailProps = {
  accessibilityLabel: string;
  count: number;
  detail: string;
  eyebrow: string;
  icon: IconName;
  items: SearchDiscoveryRailItem[];
  onPress: () => void;
  title: string;
};

const previewLimit = 3;

export function SearchDiscoveryRail({
  accessibilityLabel,
  count,
  detail,
  eyebrow,
  icon,
  items,
  onPress,
  title,
}: SearchDiscoveryRailProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.discoveryRail, pressed ? styles.pressedResultRow : null]}
    >
      <View style={styles.discoveryRailHeader}>
        <View style={styles.discoveryRailIcon}>
          <Ionicons color={ui.color.accent} name={icon} size={20} />
        </View>

        <View style={styles.discoveryRailText}>
          <AppText tone="accent" variant="caption">{eyebrow}</AppText>
          <AppText variant="section">{title}</AppText>
          <AppText numberOfLines={2} tone="muted">{detail}</AppText>
        </View>

        <View style={styles.discoveryCountPill}>
          <AppText tone="accent" variant="caption">{count}</AppText>
        </View>
      </View>

      <View style={styles.discoveryPosterRow}>
        {items.slice(0, previewLimit).map((item, index) => (
          <View key={`${item.mediaType}-${item.title}-${index}`} style={styles.discoveryPosterItem}>
            <PosterImage
              label={item.mediaType === "show" ? "TV" : "M"}
              size="search"
              uri={item.posterPath ? getTmdbPosterUrl(item.posterPath) : null}
            />
            <AppText numberOfLines={1} style={styles.discoveryPosterTitle} variant="caption">
              {item.title}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}
