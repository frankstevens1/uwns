import * as React from "react";
import { TextInput, StyleSheet, type TextInputProps } from "react-native";
import type { InputProps } from "./Input.types";
import { inputTokens, useThemeTokens } from "../../theme";

type NativeProps = InputProps &
  Omit<TextInputProps, "value" | "defaultValue" | "onChangeText" | "secureTextEntry">;

export const Input = React.forwardRef<TextInput, NativeProps>(function Input(
  { size = "md", error, onChangeText, type = "text", ...props },
  ref
) {
  const tokens = useThemeTokens();
  const t = inputTokens.base;
  const keyboardType =
    props.keyboardType ??
    (type === "number" || type === "date" ? "numeric" : undefined);

  return (
    <TextInput
      ref={ref}
      {...props}
      style={[
        styles.base,
        {
          height: size === "sm" ? t.height.sm : t.height.md,
          borderRadius: t.radius,
          borderWidth: t.borderWidth,
          borderColor: error ? tokens.color.primaryBg : tokens.color.border,
          paddingHorizontal: t.paddingX,
          fontSize: t.fontSize,
          backgroundColor: tokens.color.bg,
          color: tokens.color.fg,
        },
        props.style as any,
      ]}
      placeholder={
        type === "date" ? (props.placeholder ?? "YYYY-MM-DD") : props.placeholder
      }
      placeholderTextColor={tokens.color.mutedFg}
      onChangeText={onChangeText}
      secureTextEntry={type === "password"}
      keyboardType={keyboardType}
      autoCapitalize={props.autoCapitalize ?? "none"}
    />
  );
});

const styles = StyleSheet.create({
  base: {},
});
