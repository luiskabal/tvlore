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
      <AppText tone={tone === "neutral" ? "default" : "accent"} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  accent: {
    backgroundColor: ui.color.accentSoft,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: ui.radius.pill,
    paddingHorizontal: ui.space.md,
    paddingVertical: 5,
  },
  neutral: {
    backgroundColor: ui.color.panelAlt,
  },
});
