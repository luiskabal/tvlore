import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { PosterImage } from "./PosterImage";
import { ui } from "./tokens";

type MediaRowProps = {
  detail?: string;
  frame?: boolean;
  onPress: () => void;
  posterLabel: string;
  posterUri: string | null;
  style?: StyleProp<ViewStyle>;
  title: string;
  trailing?: string;
};

export function MediaRow({
  detail,
  frame = true,
  onPress,
  posterLabel,
  posterUri,
  style,
  title,
  trailing,
}: MediaRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        frame ? styles.frame : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <PosterImage label={posterLabel} uri={posterUri} />
      <View style={styles.text}>
        <AppText numberOfLines={2} variant="title">{title}</AppText>
        {detail ? <AppText tone="muted">{detail}</AppText> : null}
      </View>
      {trailing ? <AppText style={styles.trailing} tone="accent" variant="caption">{trailing}</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    padding: ui.space.lg,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: ui.space.md,
    justifyContent: "space-between",
  },
  text: {
    flex: 1,
    gap: ui.space.xs,
  },
  trailing: {
    minWidth: 48,
    textAlign: "right",
  },
});
