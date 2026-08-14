import { Stack, usePathname } from "expo-router";
import { SafeAreaView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppTabBar, type AppTab } from "../src/navigation/AppTabBar";
import { styles } from "../src/navigation/app-tab-bar-styles";

export default function RootLayout() {
  const activeTab = getActiveTab(usePathname());

  return (
    <GestureHandlerRootView style={styles.rootShell}>
      <View style={styles.stackShell}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {activeTab ? (
        <SafeAreaView style={styles.tabSafeArea}>
          <AppTabBar active={activeTab} />
        </SafeAreaView>
      ) : null}
    </GestureHandlerRootView>
  );
}

function getActiveTab(pathname: string): AppTab | null {
  if (pathname === "/" || pathname === "/library") {
    return "library";
  }

  if (pathname === "/search") {
    return "search";
  }

  if (pathname === "/profile") {
    return "profile";
  }

  return null;
}
