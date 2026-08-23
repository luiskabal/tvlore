import { Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AppTabBar } from "../src/navigation/AppTabBar";
import { styles } from "../src/navigation/app-tab-bar-styles";
import { getActiveTab, getTabStackScreenOptions, getVisibleTab, type AppTab } from "../src/navigation/app-tabs";

export default function RootLayout() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);
  const previousTabRef = useRef<AppTab | null>(activeTab);
  const visibleTab = getVisibleTab(pathname, previousTabRef.current);
  const tabStackScreenOptions = getTabStackScreenOptions(previousTabRef.current, activeTab);

  useEffect(() => {
    if (activeTab) {
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.rootShell}>
        <View style={styles.stackShell}>
          <Stack
            screenOptions={{
              fullScreenGestureEnabled: true,
              gestureEnabled: true,
              headerShown: false,
              ...tabStackScreenOptions,
            }}
          />
        </View>
        {visibleTab ? (
          <SafeAreaView edges={["bottom"]} style={styles.tabSafeArea}>
            <AppTabBar active={visibleTab} />
          </SafeAreaView>
        ) : null}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
