import * as React from "react";
import { Button } from "../../primitives/Button/Button.web";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "../Dialog/Dialog.web";
import type { ConfirmDialogProps } from "./ConfirmDialog.types";

function toLabel(value: React.ReactNode) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "Confirm";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  confirming,
  disabled,
  onConfirm,
}: ConfirmDialogProps) {
  const descriptionId = React.useId();

  const onConfirmClick = async () => {
    if (confirming || disabled) return;
    await onConfirm();
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          aria-describedby={description ? descriptionId : undefined}
          position="center"
        >
          <DialogTitle>{toLabel(title)}</DialogTitle>
          {description ? (
            <DialogDescription id={descriptionId}>
              {description}
            </DialogDescription>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" disabled={confirming}>
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              size="sm"
              variant={confirmVariant}
              onPress={onConfirmClick}
              disabled={disabled || confirming}
              loading={confirming}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
