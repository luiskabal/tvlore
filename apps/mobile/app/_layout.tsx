import { Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppTabBar } from "../src/navigation/AppTabBar";
import { styles } from "../src/navigation/app-tab-bar-styles";
import { getActiveTab, getTabStackScreenOptions, type AppTab } from "../src/navigation/app-tabs";

export default function RootLayout() {
  const activeTab = getActiveTab(usePathname());
  const previousTabRef = useRef<AppTab | null>(activeTab);
  const tabStackScreenOptions = getTabStackScreenOptions(previousTabRef.current, activeTab);

  useEffect(() => {
    if (activeTab) {
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  return (
    <GestureHandlerRootView style={styles.rootShell}>
      <View style={styles.stackShell}>
        <Stack screenOptions={{ headerShown: false, ...tabStackScreenOptions }} />
      </View>
      {activeTab ? (
        <SafeAreaView style={styles.tabSafeArea}>
          <AppTabBar active={activeTab} />
        </SafeAreaView>
      ) : null}
    </GestureHandlerRootView>
  );
}
