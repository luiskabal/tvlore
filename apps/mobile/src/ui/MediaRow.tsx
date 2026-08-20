import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { PosterImage } from "./PosterImage";
import { Skeleton } from "./Skeleton";
import { ui } from "./tokens";

type MediaRowProps = {
  detail?: string;
  frame?: boolean;
  onPress: () => void;
  posterLabel: string;
  posterUri: string | null;
  size?: "default" | "large" | "search";
  style?: StyleProp<ViewStyle>;
  title: string;
  trailing?: string;
};

export function MediaRow({
  detail,
  frame = true,
  onPress,
  posterLabel,
  posterUri,
  size = "default",
  style,
  title,
  trailing,
}: MediaRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        frame ? styles.frame : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <PosterImage label={posterLabel} size={size} uri={posterUri} />
      <View style={styles.text}>
        <AppText numberOfLines={2} variant="title">{title}</AppText>
        {detail ? <AppText tone="muted">{detail}</AppText> : null}
      </View>
      {trailing ? <AppText style={styles.trailing} tone="accent" variant="caption">{trailing}</AppText> : null}
    </Pressable>
  );
}

export function MediaRowSkeleton({
  frame = true,
  lines = 2,
  size = "default",
}: {
  frame?: boolean;
  lines?: number;
  size?: "default" | "large" | "search";
}) {
  const posterSize = posterSkeletonSizes[size];

  return (
    <View style={[styles.row, frame ? styles.frame : null]}>
      <Skeleton height={posterSize.height} width={posterSize.width} />
      <View style={styles.text}>
        <Skeleton height={18} width="76%" />
        {Array.from({ length: Math.max(1, lines - 1) }, (_, index) => (
          <Skeleton height={14} key={index} width={index % 2 === 0 ? "58%" : "88%"} />
        ))}
      </View>
      <Skeleton height={14} width={48} />
    </View>
  );
}

const posterSkeletonSizes = {
  default: { height: 64, width: 44 },
  large: { height: 92, width: 64 },
  search: { height: 112, width: 76 },
} as const;

const styles = StyleSheet.create({
  frame: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    padding: ui.space.lg,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: ui.space.md,
    justifyContent: "space-between",
  },
  text: {
    flex: 1,
    gap: ui.space.xs,
  },
  trailing: {
    minWidth: 48,
    textAlign: "right",
  },
});
