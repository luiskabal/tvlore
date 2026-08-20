import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { tabs, type AppTab } from "./app-tabs";
import { styles } from "./app-tab-bar-styles";

export type { AppTab } from "./app-tabs";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<AppTab, { active: IconName; inactive: IconName }> = {
  library: { active: "library", inactive: "library-outline" },
  paths: { active: "map", inactive: "map-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
  search: { active: "search", inactive: "search-outline" },
};

export function AppTabBar({ active }: { active: AppTab }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const icon = tabIcons[tab.key][isActive ? "active" : "inactive"];

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
            <View style={[styles.iconRail, isActive ? styles.activeIconRail : null]}>
              <Ionicons
                color={isActive ? styles.activeTabText.color : styles.tabText.color}
                name={icon}
                size={23}
              />
            </View>
            <Text style={[styles.tabText, isActive ? styles.activeTabText : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
