import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type ButtonVariant = "danger" | "outline" | "primary" | "secondary";
type IconName = ComponentProps<typeof Ionicons>["name"];

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon?: IconName;
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  size?: "default" | "small";
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

export function Button({
  disabled,
  icon,
  isLoading = false,
  label,
  loadingLabel,
  size = "default",
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);
  const textTone = variant === "outline" ? "default" : "inverse";
  const iconColor = variant === "outline" ? ui.color.ink : ui.color.white;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        size === "small" ? styles.small : styles.default,
        variantStyles[variant],
        isDisabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Ionicons color={iconColor} name={icon} size={size === "small" ? 15 : 17} /> : null}
        <AppText tone={textTone} variant={size === "small" ? "caption" : "button"}>
          {isLoading ? loadingLabel ?? "Loading" : label}
        </AppText>
      </View>
    </Pressable>
  );
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  danger: { backgroundColor: ui.color.danger },
  outline: { backgroundColor: ui.color.panel, borderColor: ui.color.border, borderWidth: 1 },
  primary: { backgroundColor: ui.color.accent },
  secondary: { backgroundColor: ui.color.ink },
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: ui.radius.md,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: ui.space.sm,
    justifyContent: "center",
  },
  default: {
    alignSelf: "flex-start",
    minWidth: 120,
    paddingHorizontal: ui.space.xxl,
    paddingVertical: ui.space.md,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.72,
  },
  small: {
    minWidth: 68,
    paddingHorizontal: ui.space.md,
    paddingVertical: 10,
  },
});
