import * as React from "react";
import { View, type ViewStyle } from "react-native";
import type { StackProps } from "./Stack.types";

export function Stack({
  children,
  direction = "vertical",
  gap = 8,
  align = "stretch",
  justify = "start",
  wrap = false,
  style,
}: StackProps) {
  const s: ViewStyle = {
    flexDirection: direction === "vertical" ? "column" : "row",
    rowGap: gap as any, // RN supports gap in modern versions; keep fallback below
    columnGap: gap as any,
    alignItems:
      align === "start"
        ? "flex-start"
        : align === "center"
          ? "center"
          : align === "end"
            ? "flex-end"
            : "stretch",
    justifyContent:
      justify === "start"
        ? "flex-start"
        : justify === "center"
          ? "center"
          : justify === "end"
            ? "flex-end"
            : "space-between",
    flexWrap: wrap ? "wrap" : "nowrap",
  };

  return <View style={[s, style]}>{children}</View>;
}
