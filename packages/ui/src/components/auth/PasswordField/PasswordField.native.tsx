import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { IconButton } from "../../../primitives/IconButton/IconButton.native";
import { Input } from "../../../primitives/Input/Input.native";
import { Label } from "../../../primitives/Label/Label.native";
import type { PasswordFieldProps } from "./PasswordField.types";
import { useThemeTokens } from "../../../theme";

export function PasswordField({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Your password",
  disabled,
  error,
  rightAccessory,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  const tokens = useThemeTokens();

  return (
    <View style={styles.wrap}>
      <Label>{label}</Label>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input
            type={show ? "text" : "password"}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
          />
        </View>

        {rightAccessory ?? (
          <IconButton onPress={() => setShow((v) => !v)} disabled={disabled}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.color.mutedFg }}>
              {show ? "Hide" : "Show"}
            </Text>
          </IconButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  // toggle color will be injected inline using theme tokens
});
