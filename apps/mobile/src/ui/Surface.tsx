import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ui } from "./tokens";

type SurfaceTone = "default" | "soft";

type SurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
};

export function Surface({ children, style, tone = "default" }: SurfaceProps) {
  return (
    <View style={[styles.surface, tone === "soft" ? styles.soft : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  soft: {
    backgroundColor: ui.colors.accent.surface,
    borderColor: ui.colors.accent.border,
  },
  surface: {
    ...ui.shadow.card,
    backgroundColor: ui.colors.surface.card,
    borderColor: ui.colors.border.subtle,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: ui.space.md,
    padding: ui.space.xl,
  },
});
