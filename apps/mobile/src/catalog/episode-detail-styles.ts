import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backButtonText: {
    color: ui.color.accent,
    fontSize: 16,
    fontWeight: "800",
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
    paddingTop: 48,
  },
  detail: {
    gap: 20,
  },
  clearRatingButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  disabledAction: {
    opacity: 0.56,
  },
  hero: {
    gap: 14,
  },
  heroText: {
    gap: 8,
  },
  kicker: {
    color: ui.color.accent,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  overview: {
    fontSize: 16,
    lineHeight: 23,
  },
  ratingHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingValue: {
    fontSize: 20,
    lineHeight: 25,
  },
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
  skeletonOverview: {
    gap: 10,
  },
  statusPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  still: {
    aspectRatio: 16 / 9,
    backgroundColor: ui.color.skeleton,
    borderRadius: ui.radius.md,
    width: "100%",
  },
  stillPlaceholder: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    backgroundColor: ui.color.skeleton,
    borderRadius: ui.radius.md,
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
  },
});
