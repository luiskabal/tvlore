import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type BackButtonProps = Omit<PressableProps, "children" | "style"> & {
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({ label = "Back", style, ...props }: BackButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed ? styles.pressed : null, style]}
    >
      <Ionicons color={ui.color.accent} name="chevron-back" size={18} />
      <AppText tone="accent" variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: ui.space.xs,
    paddingVertical: ui.space.xs,
  },
  pressed: {
    opacity: 0.72,
  },
});
