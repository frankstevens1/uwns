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
export const DialogClose = RadixDialog.Close;

const portalBaseClass = "fixed inset-0 z-50 pointer-events-none";

const overlayBaseClass = "absolute inset-0 z-0 pointer-events-auto bg-black/35";

const contentBaseClass =
  "fixed z-10 pointer-events-auto bg-(--ui-panel) text-(--ui-fg) focus:outline-none";

const contentPositionClass: Record<DialogPosition, string> = {
  center:
    "top-1/2 w-[92vw] max-w-md -translate-y-1/2 rounded-lg p-4 shadow-lg",
  right:
    "inset-y-0 right-0 h-full w-[96vw] max-w-3xl border-l border-(--ui-border) p-0 shadow-xl",
};

const portalBaseStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  pointerEvents: "none",
};

const overlayBaseStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.35)",
};

const contentBaseStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 10,
  pointerEvents: "auto",
  backgroundColor: "var(--ui-panel)",
  color: "var(--ui-fg)",
};

const contentPositionStyle: Record<DialogPosition, React.CSSProperties> = {
  center: {
    left: 0,
    marginLeft: "auto",
    marginRight: "auto",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  right: {
    bottom: 0,
    right: 0,
    top: 0,
  },
};

export function DialogPortal({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Portal> & {
  className?: string;
}) {
  return (
    <RadixDialog.Portal {...props}>
      <div className={cx(portalBaseClass, className)} style={portalBaseStyle}>
        {children}
      </div>
    </RadixDialog.Portal>
  );
}

export function DialogOverlay({
  className,
  style,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay> &
  DialogOverlayProps) {
  return (
    <RadixDialog.Overlay
      {...props}
      className={cx(overlayBaseClass, className)}
      style={{ ...overlayBaseStyle, ...style }}
    />
  );
}

export function DialogContent({
  position = "center",
  className,
  children,
  style,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> &
  DialogContentProps) {
  return (
    <RadixDialog.Content
      {...props}
      className={cx(
        contentBaseClass,
        contentPositionClass[position],
        className,
      )}
      style={{
        ...contentBaseStyle,
        ...contentPositionStyle[position],
        ...style,
      }}
    >
      {children}
    </RadixDialog.Content>
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
      className={cx(
        "mt-1 text-xs text-(--ui-muted-fg)",
        className,
      )}
    />
  );
}

export function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & DialogFooterProps) {
  return (
    <div
      {...props}
      className={cx("mt-4 flex justify-end gap-2", className)}
    >
      {children}
    </div>
  );
}
