import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: 18,
    padding: 24,
    paddingBottom: 32,
    paddingTop: 72,
  },
  detailText: {
    flex: 1,
    gap: 4,
  },
  emptyPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: ui.space.xl,
  },
  header: {
    gap: 8,
  },
  headerActionsRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  itemBadge: {
    alignItems: "center",
    backgroundColor: ui.color.accentSoft,
    borderColor: ui.color.panel,
    borderWidth: 1,
    borderRadius: ui.radius.pill,
    height: 24,
    justifyContent: "center",
    left: -8,
    position: "absolute",
    top: -8,
    width: 24,
  },
  itemPosterFrame: {
    position: "relative",
  },
  itemRow: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: ui.space.md,
    padding: ui.space.lg,
  },
  list: {
    gap: 10,
  },
  pathCard: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: ui.space.xl,
  },
  pressed: {
    opacity: 0.72,
  },
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
  },
});
