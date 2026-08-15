import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
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
  iconActionButton: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.pill,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  iconActionButtonActive: {
    backgroundColor: ui.color.accent,
    borderColor: ui.color.accent,
  },
  iconActionButtonDanger: {
    backgroundColor: "#fbecea",
    borderColor: ui.color.danger,
  },
  iconActionButtonDisabled: {
    opacity: 0.56,
  },
  overview: {
    fontSize: 16,
    lineHeight: 23,
  },
  pressedSeasonRow: {
    opacity: 0.72,
  },
  panelHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  providerLogo: {
    backgroundColor: ui.color.panelAlt,
    borderRadius: ui.radius.md,
    height: 44,
    width: 44,
  },
  providerFallbackText: {
    color: ui.color.ink,
    fontWeight: "800",
  },
  providerPill: {
    alignItems: "center",
    backgroundColor: ui.color.panelAlt,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    padding: 4,
    width: 54,
  },
  providerPillDisabled: {
    opacity: 0.56,
  },
  providerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  providerSection: {
    gap: 8,
  },
  providerSkeletonRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionGroup: {
    gap: 8,
  },
  quickActionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
