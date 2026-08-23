import { router, usePathname } from "expo-router";
import { useCallback, useMemo, type ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { styles } from "./app-tab-bar-styles";
import { navigationEdgePanWidth, navigationPanStartDistance, shouldCompleteBackPan } from "./navigation-gestures";

export function NavigationGestureSurface({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth/");

  const navigateBack = useCallback(() => {
    if (!isAuthRoute && canRouterGoBack()) {
      router.back();
    }
  }, [isAuthRoute]);

  const backGesture = useMemo(() => {
    const leftEdgePan = Gesture.Pan()
      .runOnJS(true)
      .enabled(!isAuthRoute)
      .hitSlop({ left: 0, width: navigationEdgePanWidth })
      .activeOffsetX([-navigationPanStartDistance, navigationPanStartDistance])
      .failOffsetY([-32, 32])
      .onEnd((event) => {
        if (event.translationX > 0 && shouldCompleteBackPan(event.translationX, event.translationY, event.velocityX)) {
          navigateBack();
        }
      });

    const rightEdgePan = Gesture.Pan()
      .runOnJS(true)
      .enabled(!isAuthRoute)
      .hitSlop({ right: 0, width: navigationEdgePanWidth })
      .activeOffsetX([-navigationPanStartDistance, navigationPanStartDistance])
      .failOffsetY([-32, 32])
      .onEnd((event) => {
        if (event.translationX < 0 && shouldCompleteBackPan(event.translationX, event.translationY, event.velocityX)) {
          navigateBack();
        }
      });

    return Gesture.Race(leftEdgePan, rightEdgePan);
  }, [isAuthRoute, navigateBack]);

  return (
    <GestureDetector gesture={backGesture}>
      <View style={styles.stackShell}>{children}</View>
    </GestureDetector>
  );
}

function canRouterGoBack() {
  try {
    return router.canGoBack();
  } catch {
    return false;
  }
}
