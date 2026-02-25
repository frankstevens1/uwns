import * as React from "react";
import { TextInput, StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import type { TextareaProps } from "./Textarea.types";
import { useThemeTokens } from "../../theme";

export function Textarea({
  value,
  onChangeText,
  placeholder,
  disabled,
  numberOfLines = 4,
  style,
}: TextareaProps) {
  const tokens = useThemeTokens();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={tokens.color.mutedFg}
      editable={!disabled}
      multiline
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          backgroundColor: tokens.color.bg,
          borderColor: tokens.color.border,
          color: tokens.color.fg,
          borderRadius: tokens.radius.md,
          fontSize: tokens.fontSize.sm,
          opacity: disabled ? tokens.opacity.disabled : 1,
        },
        style as any,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 80,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  } satisfies TextStyle & ViewStyle,
});
