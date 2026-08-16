import { StyleSheet } from "react-native";

import { ui } from "../ui";

export const styles = StyleSheet.create({
  activeFilterButton: {
    backgroundColor: ui.color.ink,
    borderColor: ui.color.ink,
  },
  activeFilterText: {
    color: ui.color.white,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
    paddingBottom: 32,
    paddingTop: 64,
  },
  disabledButton: {
    opacity: 0.6,
  },
  filterButton: {
    alignItems: "center",
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterText: {
    color: ui.color.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    gap: 8,
  },
  input: {
    backgroundColor: ui.color.white,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    color: ui.color.ink,
    fontSize: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loadingStrip: {
    alignItems: "center",
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pendingFilterButton: {
    opacity: 0.72,
  },
  recommendationsSkeleton: {
    gap: 10,
  },
  pressedResultRow: {
    opacity: 0.72,
  },
  recommendationEntry: {
    alignItems: "center",
    backgroundColor: ui.color.accentSoft,
    borderColor: "#b8ddcd",
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  recommendationEntryIcon: {
    alignItems: "center",
    backgroundColor: ui.color.accent,
    borderRadius: ui.radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  recommendationEntryMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  recommendationEntryText: {
    flex: 1,
    gap: 3,
  },
  resultBody: {
    flex: 1,
    gap: 7,
  },
  resultHeading: {
    gap: 6,
  },
  resultMeta: {
    fontSize: 13,
  },
  resultOverview: {
    lineHeight: 19,
  },
  resultRow: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 12,
  },
  resultTitle: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  resultsSection: {
    gap: 12,
  },
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
  searchButton: {
    alignSelf: "stretch",
  },
  searchPanel: {
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
  },
  skeletonBody: {
    flex: 1,
    gap: 10,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonRow: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 12,
  },
  statusPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 50,
  },
});
