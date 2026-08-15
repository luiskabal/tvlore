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
  bulkButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  episodeBody: {
    flex: 1,
    gap: 7,
  },
  episodeList: {
    gap: 12,
  },
  episodeOverview: {
    lineHeight: 19,
  },
  episodeRow: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  episodeTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  header: {
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
  screen: {
    backgroundColor: ui.color.panelAlt,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
  },
  skeletonEpisodeBody: {
    flex: 1,
    gap: 10,
  },
  skeletonEpisodeRow: {
    backgroundColor: ui.color.panel,
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
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
  statusPanel: {
    borderColor: ui.color.border,
    borderRadius: ui.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39,
  },
});
