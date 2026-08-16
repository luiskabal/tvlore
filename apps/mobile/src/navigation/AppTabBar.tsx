import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { tabs, type AppTab } from "./app-tabs";
import { styles } from "./app-tab-bar-styles";

export type { AppTab } from "./app-tabs";

export function AppTabBar({ active }: { active: AppTab }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => {
              if (isActive) {
                return;
              }

              router.replace(tab.href);
            }}
            style={[styles.tabButton, isActive ? styles.activeTabButton : null]}
          >
            <Text style={[styles.tabText, isActive ? styles.activeTabText : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
