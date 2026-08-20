import type { ComponentProps } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ui } from "./tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];
type IconButtonVariant = "primary" | "plain";

type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon: IconName;
  label: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  variant?: IconButtonVariant;
};

export function IconButton({
  disabled,
  icon,
  label,
  size = 22,
  style,
  variant = "primary",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "plain" ? styles.plain : styles.primary,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <Ionicons
        color={variant === "plain" ? ui.color.accent : ui.color.white}
        name={icon}
        size={size}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: ui.radius.md,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  disabled: {
    opacity: 0.56,
  },
  plain: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.72,
  },
  primary: {
    backgroundColor: ui.color.accent,
  },
});
