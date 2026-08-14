import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { styles } from "./app-tab-bar-styles";

export type AppTab = "library" | "profile" | "search";

const tabs: { href: Href; key: AppTab; label: string }[] = [
  { href: "/library", key: "library", label: "Library" },
  { href: "/search", key: "search", label: "Search" },
  { href: "/profile", key: "profile", label: "Profile" },
];

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
