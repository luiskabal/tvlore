import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { ui } from "./tokens";

type PageHeaderProps = {
  action?: ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader({ action, subtitle, title }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <AppText style={styles.title}>{title}</AppText>
        {subtitle ? (
          <AppText style={styles.subtitle} tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    paddingTop: ui.space.xs,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: ui.space.lg,
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  text: {
    flex: 1,
    gap: ui.space.sm,
    minWidth: 0,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 50,
  },
});
