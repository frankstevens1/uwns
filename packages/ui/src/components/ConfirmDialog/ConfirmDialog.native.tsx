import * as React from "react";
import { Alert } from "react-native";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

function toLabel(value: React.ReactNode, fallback: string) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirming,
  disabled,
  onConfirm,
}: ConfirmDialogProps) {
  const hasOpened = React.useRef(false);

  React.useEffect(() => {
    if (!open || hasOpened.current) return;
    hasOpened.current = true;

    Alert.alert(
      toLabel(title, "Confirm"),
      description ? toLabel(description, "") : undefined,
      [
        {
          text: cancelLabel,
          style: "cancel",
          onPress: () => {
            hasOpened.current = false;
            onOpenChange(false);
          },
        },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: async () => {
            if (disabled || confirming) return;
            await onConfirm();
            hasOpened.current = false;
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          hasOpened.current = false;
          onOpenChange(false);
        },
      },
    );
  }, [
    cancelLabel,
    confirmLabel,
    confirming,
    description,
    disabled,
    onConfirm,
    onOpenChange,
    open,
    title,
  ]);

  React.useEffect(() => {
    if (!open) {
      hasOpened.current = false;
    }
  }, [open]);

  return null;
}
