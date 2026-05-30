import * as React from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import type { CodeProps } from "./Code.types";
import { useThemeTokens } from "../../theme";

type NativeProps = CodeProps &
  Omit<TextProps, "children"> & {
    style?: TextStyle | TextStyle[];
  };

export function Code({ children, style, ...props }: NativeProps) {
  const tokens = useThemeTokens();

  return (
    <Text
      {...props}
      style={[
        styles.base,
        {
          backgroundColor: tokens.color.subtleBg,
          borderColor: tokens.color.border,
          color: tokens.color.fg,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "center",
    borderRadius: 6,
    borderWidth: 1,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 17,
    marginHorizontal: 2,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
});
