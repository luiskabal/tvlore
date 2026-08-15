import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { ui } from "./tokens";

type AppTextTone = "accent" | "danger" | "default" | "inverse" | "muted" | "subtle";
type AppTextVariant = "body" | "button" | "caption" | "section" | "stat" | "title";

type AppTextProps = TextProps & {
  style?: StyleProp<TextStyle>;
  tone?: AppTextTone;
  variant?: AppTextVariant;
};

const toneStyles: Record<AppTextTone, TextStyle> = {
  accent: { color: ui.color.accent },
  danger: { color: ui.color.danger },
  default: { color: ui.color.ink },
  inverse: { color: ui.color.white },
  muted: { color: ui.color.muted },
  subtle: { color: ui.color.muted2 },
};

const variantStyles: Record<AppTextVariant, TextStyle> = {
  body: { fontSize: ui.type.body, lineHeight: 20 },
  button: { fontSize: ui.type.button, fontWeight: "700" },
  caption: { fontSize: ui.type.label, fontWeight: "800" },
  section: { fontSize: ui.type.sectionTitle, fontWeight: "800" },
  stat: { fontSize: ui.type.stat, fontWeight: "900" },
  title: { fontSize: ui.type.rowTitle, fontWeight: "700" },
};

export function AppText({
  style,
  tone = "default",
  variant = "body",
  ...props
}: AppTextProps) {
  return <Text {...props} style={[variantStyles[variant], toneStyles[tone], style]} />;
}
