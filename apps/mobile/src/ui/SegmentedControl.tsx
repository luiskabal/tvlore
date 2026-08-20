import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  disabled?: boolean;
  onChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  style?: StyleProp<ViewStyle>;
  value: T;
};

export function SegmentedControl<T extends string>({
  disabled = false,
  onChange,
  options,
  style,
  value,
}: SegmentedControlProps<T>) {
  return (
    <View accessibilityRole="tablist" style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ disabled, selected: isSelected }}
            disabled={disabled}
            key={option.value}
            onPress={() => {
              if (!isSelected) {
                onChange(option.value);
              }
            }}
            style={({ pressed }) => [
              styles.option,
              isSelected ? styles.selected : null,
              disabled && !isSelected ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <AppText tone={isSelected ? "inverse" : "default"} variant="caption">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ui.color.panelAlt,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: ui.space.xs,
    padding: ui.space.xs,
  },
  disabled: {
    opacity: 0.56,
  },
  option: {
    alignItems: "center",
    borderRadius: ui.radius.sm,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: ui.space.md,
  },
  pressed: {
    opacity: 0.72,
  },
  selected: {
    backgroundColor: ui.color.ink,
  },
});
