import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ui } from "./tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type RatingStarsProps = {
  accessibilityLabelPrefix?: string;
  disabled?: boolean;
  onChange: (rating: number) => void;
  value: number | null;
};

const ratings = [1, 2, 3, 4, 5] as const;

export function RatingStars({
  accessibilityLabelPrefix = "Rate",
  disabled = false,
  onChange,
  value,
}: RatingStarsProps) {
  return (
    <View style={styles.row}>
      {ratings.map((rating) => {
        const isFilled = value !== null && rating <= value;
        const isSelected = value === rating;
        const icon = (isFilled ? "star" : "star-outline") satisfies IconName;

        return (
          <Pressable
            accessibilityLabel={`${accessibilityLabelPrefix} ${rating} out of 5`}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: isSelected }}
            disabled={disabled}
            hitSlop={8}
            key={rating}
            onPress={() => onChange(rating)}
            style={({ pressed }) => [
              styles.button,
              isSelected ? styles.selected : null,
              disabled ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color={isFilled ? ui.color.accent : ui.color.muted2}
              name={icon}
              size={25}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  disabled: {
    opacity: 0.56,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selected: {
    backgroundColor: ui.color.accentSoft,
    borderColor: ui.color.accent,
  },
});
