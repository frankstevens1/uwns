import * as React from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import { useThemeTokens } from "../../theme";
import type { SettingsRowProps } from "./SettingsRow.types";

export function SettingsRow({
  label,
  description,
  summary,
  actions,
  style,
}: SettingsRowProps) {
  const tokens = useThemeTokens();
  const labelIsText = typeof label === "string" || typeof label === "number";
  const descriptionIsText =
    typeof description === "string" || typeof description === "number";

  return (
    <View
      style={[
        styles.root,
        {
          borderColor: tokens.color.border,
          backgroundColor: tokens.color.subtleBg,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {labelIsText ? (
          <RNText style={[styles.label, { color: tokens.color.fg }]}>
            {label}
          </RNText>
        ) : (
          label
        )}
        {description ? (
          descriptionIsText ? (
            <RNText style={[styles.description, { color: tokens.color.mutedFg }]}>
              {description}
            </RNText>
          ) : (
            description
          )
        ) : null}
      </View>

      <View style={styles.right}>
        {summary ? <View>{summary}</View> : null}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    rowGap: 10,
  },
  content: {
    rowGap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
  },
  right: {
    rowGap: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
});
