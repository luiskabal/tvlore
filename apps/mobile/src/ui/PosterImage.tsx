import { Image, StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type PosterImageProps = {
  label: string;
  size?: "default" | "detail" | "large" | "search";
  uri: string | null;
};

export function PosterImage({ label, size = "default", uri }: PosterImageProps) {
  const frameStyle = styles[size];

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
  detail: {
    height: 168,
    width: 114,
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
  search: {
    height: 112,
    width: 76,
  },
});
