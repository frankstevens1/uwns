import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cx } from "../../utils/cx";
import type {
  DialogContentProps,
  DialogFooterProps,
  DialogOverlayProps,
  DialogPosition,
} from "./Dialog.types";

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

const overlayBaseClass = "fixed inset-0 z-40 bg-black/35";

const contentBaseClass = "z-50 focus:outline-none";

const contentPositionClass: Record<DialogPosition, string> = {
  center:
    "fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 p-4",
  right: "fixed inset-y-0 right-0 w-[96vw] max-w-3xl border-l p-0",
};

export function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay> &
  DialogOverlayProps) {
  return (
    <RadixDialog.Overlay
      {...props}
      className={cx(overlayBaseClass, className)}
    />
  );
}

export function DialogContent({
  position,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> &
  DialogContentProps) {
  return (
    <RadixDialog.Content
      {...props}
      className={cx(
        contentBaseClass,
        position ? contentPositionClass[position] : undefined,
        className,
      )}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      {...props}
      className={cx("text-sm font-semibold", className)}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      {...props}
      className={cx("mt-1 text-xs text-(--ui-muted-fg)", className)}
    />
  );
}

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cx("mt-4 flex justify-end gap-2", className)}>
      {children}
    </div>
  );
}
