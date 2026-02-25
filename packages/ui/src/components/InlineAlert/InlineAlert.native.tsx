import * as React from "react";
import { View, Text as RNText, StyleSheet } from "react-native";
import type { InlineAlertProps } from "./InlineAlert.types";
import { useThemeTokens } from "../../theme";

export function InlineAlert({
  tone = "info",
  title,
  message,
  children,
  style,
}: InlineAlertProps) {
  const tokens = useThemeTokens();

  const borderColor =
    tone === "success"
      ? tokens.color.successBorder
      : tone === "warning"
        ? tokens.color.warningBorder
        : tone === "error"
          ? tokens.color.dangerBorder
          : tokens.color.infoBorder;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tokens.color.subtleBg,
          borderColor,
          borderRadius: tokens.radius.lg,
        },
        style,
      ]}
    >
      {title ? (
        <RNText style={{ color: tokens.color.fg, fontSize: 13, fontWeight: "600" }}>
          {title}
        </RNText>
      ) : null}

      {message ? (
        <RNText style={{ marginTop: 4, color: tokens.color.mutedFg, fontSize: 12 }}>
          {message}
        </RNText>
      ) : null}

      {children ? <View style={{ marginTop: 8 }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    padding: 10,
  },
});
