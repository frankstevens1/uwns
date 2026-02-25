import type { FormControlProps } from "./FormControl.types";
import { View } from "react-native";
import { Text, Label, Stack } from "../../index.native";

export function FormControl({
  label,
  hint,
  error,
  required,
  children,
  style,
}: FormControlProps) {
  const showError = Boolean(error);

  return (
    <View style={style}>
      <Stack direction="vertical" gap={6}>
        {label ? (
          <Stack direction="horizontal" gap={6} align="center">
            <Label>{label}</Label>
            {required ? <Text variant="label" tone="muted">*</Text> : null}
          </Stack>
        ) : null}

        {children}

        {showError ? (
          <Text variant="error" tone="danger">
            {error}
          </Text>
        ) : hint ? (
          <Text variant="hint" tone="muted">
            {hint}
          </Text>
        ) : null}
      </Stack>
    </View>
  );
}
