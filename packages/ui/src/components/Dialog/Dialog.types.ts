import * as React from "react";

export type DialogPosition = "center" | "right";

export type DialogRootProps = {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DialogPrimitiveProps = {
  children?: React.ReactNode;
  asChild?: boolean;
};

export type DialogOverlayProps = {
  children?: React.ReactNode;
  className?: string;
};

export type DialogContentProps = {
  children?: React.ReactNode;
  className?: string;
  position?: DialogPosition;
};

export type DialogTextProps = {
  children?: React.ReactNode;
  className?: string;
};

export type DialogFooterProps = {
  children?: React.ReactNode;
  className?: string;
};
