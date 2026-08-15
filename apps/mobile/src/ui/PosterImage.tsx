import { Image, StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type PosterImageProps = {
  label: string;
  size?: "default" | "large";
  uri: string | null;
};

export function PosterImage({ label, size = "default", uri }: PosterImageProps) {
  const frameStyle = size === "large" ? styles.large : styles.default;

  if (uri) {
    return <Image source={{ uri }} style={[styles.poster, frameStyle]} />;
  }

  return (
    <View style={[styles.placeholder, frameStyle]}>
      <AppText tone="muted" variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    height: 64,
    width: 44,
  },
  large: {
    height: 92,
    width: 64,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: ui.color.skeleton,
    borderRadius: ui.radius.sm,
    justifyContent: "center",
  },
  poster: {
    backgroundColor: ui.color.skeleton,
    borderRadius: ui.radius.sm,
  },
});
