import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type BadgeProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
  tone?: "accent" | "neutral";
};

export function Badge({ label, style, tone = "accent" }: BadgeProps) {
  return (
    <View style={[styles.badge, tone === "neutral" ? styles.neutral : styles.accent, style]}>
      <AppText tone={tone === "neutral" ? "muted" : "accent"} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  accent: {
    backgroundColor: ui.colors.accent.surface,
    borderColor: ui.colors.accent.border,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: ui.radius.pill,
    paddingHorizontal: ui.space.md,
    paddingVertical: 5,
  },
  neutral: {
    backgroundColor: ui.colors.surface.cardElevated,
    borderColor: ui.colors.border.subtle,
  },
});
