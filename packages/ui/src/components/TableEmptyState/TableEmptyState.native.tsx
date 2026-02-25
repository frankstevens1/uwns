import * as React from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import type { TableEmptyStateProps } from "./TableEmptyState.types";
import { useThemeTokens } from "../../theme";

export function TableEmptyState({
  children,
  align = "center",
  style,
}: TableEmptyStateProps) {
  const tokens = useThemeTokens();
  const isText = typeof children === "string" || typeof children === "number";

  return (
    <View
      style={[
        styles.base,
        align === "center" ? styles.center : styles.left,
        style,
      ]}
    >
      {isText ? (
        <RNText style={[styles.text, { color: tokens.color.mutedFg }]}>
          {children}
        </RNText>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  left: {
    alignItems: "flex-start",
  },
  text: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
