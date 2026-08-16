import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { tabs, type AppTab } from "./app-tabs";
import { styles } from "./app-tab-bar-styles";

export type { AppTab } from "./app-tabs";

export function AppTabBar({ active }: { active: AppTab }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="button"
          key={tab.key}
          onPress={() => router.replace(tab.href)}
          style={[styles.tabButton, active === tab.key ? styles.activeTabButton : null]}
        >
          <Text style={[styles.tabText, active === tab.key ? styles.activeTabText : null]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
