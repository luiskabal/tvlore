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
  checkInPage: {
    gap: 16,
  },
  checkInSection: {
    gap: 8,
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
  checkInCard: {
    ...ui.shadow.card,
    backgroundColor: ui.colors.surface.cardElevated,
    borderColor: ui.colors.border.subtle,
    borderRadius: ui.radius.large,
    borderWidth: 1,
    gap: ui.space.md,
    padding: ui.space.lg,
  },
  checkInComment: {
    lineHeight: 23,
  },
  checkInMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ui.space.sm,
  },
  detail: {
    gap: 20,
  },
  heroBackdrop: {
    backgroundColor: ui.colors.surface.cardElevated,
    borderColor: ui.colors.border.subtle,
    borderRadius: ui.radius.xl,
    borderWidth: 1,
    minHeight: 260,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroBackdropFallback: {
    minHeight: 220,
  },
  heroBackdropImage: {
    borderRadius: ui.radius.xl,
  },
  heroBackdropOverlay: {
    bottom: 0,
    backgroundColor: ui.colors.surface.overlay,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroContent: {
    justifyContent: "flex-end",
    minHeight: 220,
    padding: ui.space.lg,
    paddingTop: 116,
  },
  heroHeaderRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    zIndex: 1,
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
  iconActionButtonDisabled: {
    opacity: 0.56,
  },
  inlineRatingEditor: {
    gap: 8,
  },
  manualCharacterButton: {
    alignSelf: "flex-start",
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  manualCharacterButtonText: {
    color: ui.color.ink,
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
    backgroundColor: ui.colors.background.elevated,
    borderRadius: ui.radius.md,
    height: 44,
    width: 44,
  },
  providerLogoFallback: {
    alignItems: "center",
    backgroundColor: ui.colors.background.elevated,
    borderRadius: ui.radius.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  providerFallbackText: {
    color: ui.color.ink,
    fontWeight: "800",
  },
  providerList: {
    gap: ui.space.sm,
  },
  providerRowItem: {
    alignItems: "center",
    backgroundColor: ui.colors.surface.cardElevated,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: ui.space.md,
    minHeight: 60,
    padding: ui.space.sm,
  },
  providerRowDisabled: {
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
  providerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
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
    flexDirection: "row",
    gap: 6,
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
    borderColor: ui.color.accentBorder,
  },
  ratingMetricUser: {
    alignItems: "flex-end",
  },
  ratingMetricValue: {
    fontSize: 18,
    lineHeight: 23,
  },
  ratingMetricPublicValue: {
    color: ui.colors.rating.star,
  },
  ratingMetricUserValue: {
    color: ui.colors.accent.bright,
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  readonlyRatingRow: {
    flexDirection: "row",
    gap: 2,
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
  trackingActionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
