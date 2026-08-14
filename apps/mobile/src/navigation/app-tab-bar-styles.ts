import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  activeTabButton: {
    backgroundColor: "#171412",
  },
  activeTabText: {
    color: "#ffffff",
  },
  tabBar: {
    backgroundColor: "#f7f4ee",
    borderColor: "#d8d0c5",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  tabText: {
    color: "#5f564d",
    fontSize: 13,
    fontWeight: "800",
  },
});
