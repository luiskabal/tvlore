import { Image, StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type StillImageProps = {
  label: string;
  uri: string | null;
};

export function StillImage({ label, uri }: StillImageProps) {
  if (uri) {
    return <Image source={{ uri }} style={styles.still} />;
  }

  return (
    <View style={styles.placeholder}>
      <AppText tone="muted" variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    backgroundColor: ui.colors.background.elevated,
    borderRadius: ui.radius.md,
    borderColor: ui.colors.border.subtle,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 96,
  },
  still: {
    backgroundColor: ui.colors.background.elevated,
    borderRadius: ui.radius.md,
    height: 64,
    width: 96,
  },
});
