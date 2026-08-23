import { router, usePathname } from "expo-router";
import { useMemo, type ReactNode } from "react";
import { PanResponder, View, useWindowDimensions } from "react-native";

import { styles } from "./app-tab-bar-styles";
import { isBackPanStart, shouldCompleteBackPan } from "./navigation-gestures";

export function NavigationGestureSurface({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isAuthRoute = pathname.startsWith("/auth/");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (event, gestureState) =>
          isBackPanStart({
            canGoBack: !isAuthRoute && canRouterGoBack(),
            dx: gestureState.dx,
            dy: gestureState.dy,
            startX: event.nativeEvent.pageX,
            width,
          }),
        onPanResponderRelease: (_event, gestureState) => {
          if (shouldCompleteBackPan(gestureState.dx, gestureState.dy, gestureState.vx) && canRouterGoBack()) {
            router.back();
          }
        },
        onShouldBlockNativeResponder: () => false,
      }),
    [isAuthRoute, width],
  );

  return (
    <View {...panResponder.panHandlers} style={styles.stackShell}>
      {children}
    </View>
  );
}

function canRouterGoBack() {
  try {
    return router.canGoBack();
  } catch {
    return false;
  }
}
