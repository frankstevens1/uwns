import * as React from "react";
import { Pressable, View, StyleSheet, Text } from "react-native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import type { PasswordFieldProps } from "./PasswordField.types";
import { inputTokens, useThemeTokens } from "../../../theme";

export function PasswordField({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Your password",
  disabled,
  error,
  rightAccessory,
  labelAccessory,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  const tokens = useThemeTokens();

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Label>{label}</Label>
        {labelAccessory}
      </View>

      <View style={styles.inputWrap}>
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          style={styles.input}
        />

        {rightAccessory ?? (
          <Pressable
            onPress={() => setShow((v) => !v)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={show ? "Hide password" : "Show password"}
            hitSlop={8}
            style={styles.toggle}
          >
            <Text
              numberOfLines={1}
              style={{ fontSize: 12, fontWeight: "600", color: tokens.color.mutedFg }}
            >
              {show ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  inputWrap: { position: "relative", width: "100%" },
  input: { paddingRight: inputTokens.base.paddingX + 54 },
  toggle: {
    position: "absolute",
    right: inputTokens.base.paddingX,
    top: 0,
    bottom: 0,
    minWidth: 34,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  // toggle color will be injected inline using theme tokens
});
