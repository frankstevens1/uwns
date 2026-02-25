import * as React from "react";
import { Text as RNText, StyleSheet, type TextStyle } from "react-native";
import type { TextProps } from "./Text.types";
import { useThemeTokens } from "../../theme";

export function Text({
  children,
  tone = "default",
  variant = "body",
  align = "left",
  numberOfLines,
  style,
}: TextProps) {
  const tokens = useThemeTokens();

  const color =
    tone === "muted"
      ? tokens.color.mutedFg
      : tone === "danger"
        ? tokens.color.dangerFg
        : tone === "success"
          ? tokens.color.successFg
          : tokens.color.fg;

  const variantStyle: TextStyle =
    variant === "title"
      ? styles.title
      : variant === "label"
        ? styles.label
        : variant === "hint"
          ? styles.hint
          : variant === "error"
            ? styles.error
            : styles.body;

  const alignStyle: TextStyle =
    align === "center"
      ? { textAlign: "center" }
      : align === "right"
        ? { textAlign: "right" }
        : { textAlign: "left" };

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[variantStyle, alignStyle, { color }, style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 13 },
  title: { fontSize: 15, fontWeight: "600" },
  label: { fontSize: 11, fontWeight: "600" },
  hint: { fontSize: 11 },
  error: { fontSize: 11, fontWeight: "500" },
});
