import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "./AppText";
import { BrandMark } from "./BrandMark";
import { ui } from "./tokens";

type PageHeaderProps = {
  action?: ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader({ action, subtitle, title }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <BrandMark />
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
    paddingTop: 2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: ui.space.md,
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: ui.type.body,
    lineHeight: 23,
  },
  text: {
    flex: 1,
    gap: ui.space.xs,
    minWidth: 0,
  },
  title: {
    fontSize: ui.type.screenTitle,
    fontWeight: "800",
    lineHeight: 36,
  },
});
