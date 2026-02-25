import type * as React from "react";
import type { ButtonVariant } from "../../primitives/Button/Button.types";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  confirming?: boolean;
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
};
