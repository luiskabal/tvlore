import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type StatCardProps = Omit<PressableProps, "children"> & {
  isActive?: boolean;
  label: string;
  value: number;
};

export function StatCard({ isActive = false, label, value, ...props }: StatCardProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      style={({ pressed }) => [
        styles.card,
        isActive ? styles.active : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <AppText tone={isActive ? "accent" : "default"} variant="stat">{value}</AppText>
      <AppText tone={isActive ? "accent" : "muted"} variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: ui.color.accentSoft,
    borderColor: ui.color.accent,
  },
  card: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    gap: ui.space.xs,
    padding: ui.space.lg,
  },
  pressed: {
    opacity: 0.72,
  },
});
