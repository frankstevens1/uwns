import type { FormControlProps } from "./FormControl.types";
import { Label, Text, Stack } from "../../index.web";

export function FormControl({
  label,
  hint,
  error,
  required,
  children,
  className = "",
  style,
}: FormControlProps) {
  const showError = Boolean(error);

  return (
    <div className={className} style={style}>
      <Stack direction="vertical" gap={6}>
        {label ? (
          <div className="flex items-center gap-2">
            <Label>{label}</Label>
            {required ? (
              <Text variant="label" tone="muted">
                *
              </Text>
            ) : null}
          </div>
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
    </div>
  );
}
