import * as React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { TipProps } from "./Tip.types";
import { useThemeTokens } from "../../theme";

function splitTextNodes(value: string | number) {
  return String(value)
    .split(/(\s+)/)
    .filter(Boolean);
}

export function Tip({ children, title, icon = true, style }: TipProps) {
  const tokens = useThemeTokens();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: tokens.color.subtleBg,
          borderColor: tokens.color.border,
          borderRadius: tokens.radius.lg,
        },
        style,
      ]}
    >
      {icon ? (
        <MaterialIcons
          name="info-outline"
          size={17}
          color={tokens.color.fg}
          style={styles.icon}
        />
      ) : null}
      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: tokens.color.fg }]}>
            {title}
          </Text>
        ) : null}
        <View style={styles.bodyRow}>
          {React.Children.map(children, (child, index) => {
            if (typeof child === "string" || typeof child === "number") {
              return splitTextNodes(child).map((part, partIndex) => (
                <Text
                  key={`${index}-${partIndex}`}
                  style={[styles.body, { color: tokens.color.mutedFg }]}
                >
                  {part}
                </Text>
              ));
            }

            return child;
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  icon: {
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 13,
    lineHeight: 21,
  },
  bodyRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
