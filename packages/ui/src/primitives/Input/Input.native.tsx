import * as React from "react";
import { TextInput, StyleSheet, type TextInputProps } from "react-native";
import type { InputProps } from "./Input.types";
import { inputTokens, useThemeTokens } from "../../theme";

type NativeProps = Omit<InputProps, "autoComplete"> &
  Omit<TextInputProps, "value" | "defaultValue" | "onChangeText" | "secureTextEntry">;

function getDefaultKeyboardType(
  type: InputProps["type"],
): TextInputProps["keyboardType"] {
  if (type === "email") return "email-address";
  if (type === "number" || type === "date") return "numeric";
  return undefined;
}

function getDefaultAutoComplete(
  type: InputProps["type"],
): TextInputProps["autoComplete"] {
  if (type === "email") return "email";
  if (type === "password") return "current-password";
  return undefined;
}

function getDefaultTextContentType(
  type: InputProps["type"],
): TextInputProps["textContentType"] {
  if (type === "email") return "emailAddress";
  if (type === "password") return "password";
  return undefined;
}

export const Input = React.forwardRef<TextInput, NativeProps>(function Input(
  {
    size = "md",
    error,
    onChangeText,
    type = "text",
    autoComplete,
    keyboardType,
    textContentType,
    ...props
  },
  ref
) {
  const tokens = useThemeTokens();
  const t = inputTokens.base;
  const resolvedKeyboardType = keyboardType ?? getDefaultKeyboardType(type);
  const resolvedAutoComplete = autoComplete ?? getDefaultAutoComplete(type);
  const resolvedTextContentType =
    textContentType ?? getDefaultTextContentType(type);

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
      keyboardType={resolvedKeyboardType}
      autoComplete={resolvedAutoComplete}
      textContentType={resolvedTextContentType}
      autoCapitalize={props.autoCapitalize ?? "none"}
    />
  );
});

const styles = StyleSheet.create({
  base: {},
});
