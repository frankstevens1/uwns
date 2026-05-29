import * as React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { OtpCodeInputProps } from "./OtpCodeInput.types";
import { inputTokens, useThemeTokens } from "../../../theme";

function sanitizeCode(value: string, length: number) {
  return value.replace(/\D/g, "").slice(0, length);
}

export function OtpCodeInput({
  value,
  onChangeText,
  length = 6,
  disabled,
}: OtpCodeInputProps) {
  const tokens = useThemeTokens();
  const t = inputTokens.base;
  const inputRef = React.useRef<TextInput | null>(null);
  const code = sanitizeCode(value, length);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => inputRef.current?.focus()}
      style={styles.wrap}
    >
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(nextValue) => onChangeText(sanitizeCode(nextValue, length))}
        editable={!disabled}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={length}
        style={styles.hiddenInput}
      />
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.cell,
            {
              height: t.height.md,
              borderRadius: t.radius,
              borderWidth: t.borderWidth,
              borderColor: tokens.color.border,
              backgroundColor: tokens.color.bg,
            },
          ]}
        >
          <Text style={[styles.cellText, { color: tokens.color.fg }]}>
            {code[index] ?? ""}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 8 },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontFamily: "monospace",
    fontSize: inputTokens.base.fontSize,
    fontWeight: "600",
    includeFontPadding: false,
  },
});
