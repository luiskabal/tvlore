import { Redirect, Stack, usePathname, type Href } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useAuthSession } from "../src/auth/use-auth-session";
import { AppTabBar } from "../src/navigation/AppTabBar";
import { styles } from "../src/navigation/app-tab-bar-styles";
import {
  getActiveTab,
  getAuthRedirect,
  getTabStackScreenOptions,
  getVisibleTab,
  type AppTab,
} from "../src/navigation/app-tabs";
import { ui } from "../src/ui";

export default function RootLayout() {
  const pathname = usePathname();
  const handleSessionChange = useCallback(() => undefined, []);
  const { auth } = useAuthSession(handleSessionChange);
  const activeTab = getActiveTab(pathname);
  const previousTabRef = useRef<AppTab | null>(activeTab);
  const visibleTab = getVisibleTab(pathname, previousTabRef.current);
  const tabStackScreenOptions = getTabStackScreenOptions(previousTabRef.current, activeTab);
  const authRedirect = getAuthRedirect(pathname, auth.kind);

  useEffect(() => {
    if (activeTab) {
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.rootShell}>
        {auth.kind === "loading" ? <AuthLoadingScreen /> : authRedirect ? <Redirect href={authRedirect as Href} /> : (
          <>
            <Stack
              screenOptions={{
                fullScreenGestureEnabled: true,
                gestureEnabled: true,
                headerShown: false,
                ...tabStackScreenOptions,
              }}
            />
            {visibleTab ? (
              <SafeAreaView edges={["bottom"]} style={styles.tabSafeArea}>
                <AppTabBar active={visibleTab} />
              </SafeAreaView>
            ) : null}
          </>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AuthLoadingScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={authLoadingStyles.screen}>
      <ActivityIndicator color={ui.color.accentBright} size="large" />
      <Text style={authLoadingStyles.text}>Checking your session...</Text>
    </SafeAreaView>
  );
}

const authLoadingStyles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: ui.colors.background.primary,
    flex: 1,
    gap: ui.space.md,
    justifyContent: "center",
    padding: ui.space.xl,
  },
  text: {
    color: ui.color.muted,
    fontSize: ui.type.body,
  },
});
