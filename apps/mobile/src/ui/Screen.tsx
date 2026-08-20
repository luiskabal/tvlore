import type { ReactNode } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { ui } from "./tokens";

type ContentOptions = {
  bottom?: number;
  gap?: number;
  top?: number;
};

type ScreenProps = ViewProps & {
  children: ReactNode;
};

type ScreenContentProps = ViewProps & {
  children: ReactNode;
  fill?: boolean;
  options?: ContentOptions;
  style?: StyleProp<ViewStyle>;
};

type ScreenScrollProps = Omit<ScrollViewProps, "contentContainerStyle"> & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  options?: ContentOptions;
};

export function Screen({ children, style, ...props }: ScreenProps) {
  return (
    <SafeAreaView {...props} style={[styles.screen, style]}>
      <StatusBar style="dark" />
      {children}
    </SafeAreaView>
  );
}

export function ScreenContent({ children, fill = false, options, style, ...props }: ScreenContentProps) {
  const contentStyle = useScreenContentStyle(options);

  return (
    <View {...props} style={[contentStyle, fill ? styles.fill : null, style]}>
      {children}
    </View>
  );
}

export function ScreenScroll({
  children,
  contentContainerStyle,
  options,
  ...props
}: ScreenScrollProps) {
  const contentStyle = useScreenContentStyle(options);

  return (
    <ScrollView {...props} contentContainerStyle={[contentStyle, contentContainerStyle]}>
      {children}
    </ScrollView>
  );
}

export function useScreenContentStyle(options: ContentOptions = {}) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? ui.space.xxl : 24;
  const maxWidth = width >= 760 ? 680 : undefined;

  return [
    styles.content,
    {
      gap: options.gap ?? 20,
      maxWidth,
      paddingBottom: options.bottom ?? 32,
      paddingHorizontal: horizontalPadding,
      paddingTop: options.top ?? 64,
    },
  ];
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    flexGrow: 1,
    width: "100%",
  },
  fill: {
    flex: 1,
  },
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
});
