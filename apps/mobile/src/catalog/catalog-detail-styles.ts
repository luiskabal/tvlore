import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backButtonText: {
    color: "#1f7a5c",
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
  hero: {
    flexDirection: "row",
    gap: 16,
  },
  heroText: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  overview: {
    fontSize: 16,
    lineHeight: 23,
  },
  pressedSeasonRow: {
    opacity: 0.72,
  },
  ratingButton: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  ratingButtonSelected: {
    backgroundColor: ui.color.accent,
    borderColor: ui.color.accent,
  },
  ratingButtonText: {
    color: ui.color.ink,
  },
  ratingButtonTextSelected: {
    color: ui.color.white,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
  },
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
  seasonBody: {
    flex: 1,
    gap: 4,
  },
  seasonRow: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  seasonTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  seasonsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
  },
  skeletonHeroText: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  skeletonOverview: {
    gap: 10,
  },
  skeletonPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  skeletonSeasonBody: {
    flex: 1,
    gap: 8,
  },
  skeletonSeasonRow: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  statusPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 36,
  },
});
