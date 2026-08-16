import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  actionMessageGroup: {
    gap: 6,
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
  checkInBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(23, 20, 18, 0.38)",
  },
  checkInHandle: {
    alignSelf: "center",
    backgroundColor: ui.color.border,
    borderRadius: ui.radius.pill,
    height: 4,
    width: 48,
  },
  checkInOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  checkInSheet: {
    backgroundColor: ui.color.panel,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 12,
    padding: 24,
    paddingBottom: 34,
  },
  castChoice: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 6,
    padding: 8,
    width: 112,
  },
  castChoiceActor: {
    color: ui.color.muted,
    maxWidth: "100%",
  },
  castChoiceSelected: {
    backgroundColor: ui.color.accentSoft,
    borderColor: ui.color.accent,
  },
  castChoiceSelectedText: {
    color: ui.color.accent,
    textAlign: "center",
  },
  castChoiceText: {
    color: ui.color.ink,
    textAlign: "center",
  },
  castImage: {
    backgroundColor: ui.color.panelAlt,
    borderRadius: ui.radius.md,
    height: 64,
    width: 64,
  },
  castImagePlaceholder: {
    alignItems: "center",
    backgroundColor: ui.color.panelAlt,
    borderRadius: ui.radius.md,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  castImagePlaceholderText: {
    color: ui.color.muted,
    fontSize: 18,
    fontWeight: "800",
  },
  castPickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  castPickerScroll: {
    marginHorizontal: -2,
  },
  castPickerSection: {
    gap: 8,
  },
  castSkeleton: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 8,
    width: 112,
  },
  castSkeletonText: {
    backgroundColor: ui.color.border,
    borderRadius: ui.radius.pill,
    height: 12,
    width: 74,
  },
  checkInCommentInput: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  checkInInput: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    color: ui.color.ink,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  detail: {
    gap: 20,
  },
  hero: {
    flexDirection: "row",
    gap: 16,
  },
  heroHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  heroText: {
    flex: 1,
    justifyContent: "center",
  },
  heroTitleBlock: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  iconActionButton: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
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
  inlineRatingEditor: {
    gap: 8,
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
  quickActionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  reactionPill: {
    alignItems: "center",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  reactionPillSelected: {
    backgroundColor: ui.color.accentSoft,
    borderColor: ui.color.accent,
  },
  reactionPillText: {
    color: ui.color.ink,
  },
  reactionPillTextSelected: {
    color: ui.color.accent,
  },
  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  ratingCompareRow: {
    flexDirection: "row",
    gap: 10,
  },
  ratingMatchSection: {
    gap: 10,
  },
  ratingMetric: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ratingMetricSpoiler: {
    backgroundColor: ui.color.accentSoft,
    borderColor: "#b8ddcd",
  },
  ratingMetricUser: {
    alignItems: "flex-end",
  },
  ratingMetricValue: {
    fontSize: 18,
    lineHeight: 23,
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  clearRatingInlineButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
