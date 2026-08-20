import type { ComponentProps, ReactNode } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { Surface } from "./Surface";
import { ui } from "./tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type EmptyStateProps = {
  action?: ReactNode;
  detail: string;
  icon?: IconName;
  title: string;
};

export function EmptyState({
  action,
  detail,
  icon = "sparkles-outline",
  title,
}: EmptyStateProps) {
  return (
    <Surface style={styles.surface}>
      <View style={styles.iconFrame}>
        <Ionicons color={ui.color.accent} name={icon} size={22} />
      </View>
      <View style={styles.text}>
        <AppText variant="section">{title}</AppText>
        <AppText tone="muted">{detail}</AppText>
      </View>
      {action}
    </Surface>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    alignItems: "center",
    backgroundColor: ui.color.accentSoft,
    borderRadius: ui.radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  surface: {
    alignItems: "flex-start",
    gap: ui.space.md,
  },
  text: {
    gap: ui.space.xs,
  },
});
