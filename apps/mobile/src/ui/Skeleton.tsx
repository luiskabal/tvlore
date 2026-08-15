import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";

import { ui } from "./tokens";

type SkeletonProps = {
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
};

export function Skeleton({ height, radius = ui.radius.md, style, width = "100%" }: SkeletonProps) {
  return <View style={[styles.block, { borderRadius: radius, height, width }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: ui.color.skeleton,
  },
});
