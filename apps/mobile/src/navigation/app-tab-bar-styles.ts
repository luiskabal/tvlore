import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  activeTabButton: {
    opacity: 1,
  },
  activeTabText: {
    color: ui.colors.accent.bright,
  },
  rootShell: {
    backgroundColor: ui.colors.background.primary,
    flex: 1,
  },
  stackShell: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: ui.colors.background.secondary,
    borderColor: ui.colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 52,
  },
  iconRail: {
    alignItems: "center",
    borderTopColor: "transparent",
    borderTopWidth: 3,
    height: 30,
    justifyContent: "center",
    minWidth: 44,
    paddingTop: 3,
  },
  activeIconRail: {
    borderTopColor: ui.colors.accent.bright,
  },
  tabText: {
    color: ui.colors.text.tertiary,
    fontSize: 11,
    fontWeight: "800",
  },
  tabSafeArea: {
    backgroundColor: ui.colors.background.secondary,
  },
});
