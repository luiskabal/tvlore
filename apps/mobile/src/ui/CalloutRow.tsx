import type { ComponentProps, ReactNode } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];
type CalloutTone = "accent" | "default";

type CalloutRowProps = {
  accessibilityLabel: string;
  detail: string;
  eyebrow?: string;
  icon: IconName;
  meta?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  title: string;
  tone?: CalloutTone;
};

export function CalloutRow({
  accessibilityLabel,
  detail,
  eyebrow,
  icon,
  meta,
  onPress,
  style,
  title,
  tone = "default",
}: CalloutRowProps) {
  const isAccent = tone === "accent";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isAccent ? styles.accentRow : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <View style={[styles.iconFrame, isAccent ? styles.accentIconFrame : null]}>
        <Ionicons color={isAccent ? ui.color.white : ui.color.accent} name={icon} size={22} />
      </View>

      <View style={styles.text}>
        {eyebrow ? <AppText tone="accent" variant="caption">{eyebrow}</AppText> : null}
        <AppText numberOfLines={2} variant="section">{title}</AppText>
        <AppText numberOfLines={2} tone="muted">{detail}</AppText>
      </View>

      <View style={styles.meta}>
        {meta}
        <Ionicons color={ui.color.muted} name="chevron-forward" size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accentIconFrame: {
    backgroundColor: ui.color.accent,
  },
  accentRow: {
    backgroundColor: ui.color.accentSoft,
    borderColor: "#b8ddcd",
  },
  iconFrame: {
    alignItems: "center",
    backgroundColor: ui.color.panelAlt,
    borderRadius: ui.radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: ui.space.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: ui.space.md,
    padding: ui.space.lg,
  },
  text: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
});
