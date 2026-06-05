import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Button as UiButton } from "../../primitives/Button/Button.web";
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

const contentBaseClass = "fixed z-10 pointer-events-auto focus:outline-none";

const contentPositionClass: Record<DialogPosition, string> = {
  center: "",
  right: "inset-y-0 right-0 h-full w-[96vw] max-w-3xl p-0",
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
  borderColor: "var(--ui-border)",
  borderStyle: "solid",
  borderWidth: 1,
  boxShadow:
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  color: "var(--ui-fg)",
};

const contentPositionStyle: Record<DialogPosition, React.CSSProperties> = {
  center: {
    boxSizing: "border-box",
    borderRadius: 8,
    left: "50%",
    maxHeight: "calc(100dvh - 2rem)",
    maxWidth: "28rem",
    overflowY: "auto",
    padding: 16,
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "calc(100vw - 2rem)",
  },
  right: {
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    bottom: 0,
    boxShadow:
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    height: "100%",
    maxWidth: "48rem",
    padding: 0,
    right: 0,
    top: 0,
    width: "96vw",
  },
};

const maxWidthByClassName: Record<string, string> = {
  "max-w-xs": "20rem",
  "max-w-sm": "24rem",
  "max-w-md": "28rem",
  "max-w-lg": "32rem",
  "max-w-xl": "36rem",
  "max-w-2xl": "42rem",
  "max-w-3xl": "48rem",
  "max-w-4xl": "56rem",
  "max-w-5xl": "64rem",
};

function isFromUiFloatingLayer(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-ui-floating-layer]"))
  );
}

function isFloatingLayerOutsideEvent(event: Event) {
  const originalEvent =
    "detail" in event &&
    event.detail &&
    typeof event.detail === "object" &&
    "originalEvent" in event.detail &&
    event.detail.originalEvent instanceof Event
      ? event.detail.originalEvent
      : null;

  return (
    isFromUiFloatingLayer(event.target) ||
    isFromUiFloatingLayer(originalEvent?.target ?? null)
  );
}

export function DialogPortal({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Portal> & {
  className?: string;
}) {
  return (
    <RadixDialog.Portal {...props}>
      <div
        data-ui-dialog-portal=""
        className={cx(portalBaseClass, className)}
        style={portalBaseStyle}
      >
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
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> &
  DialogContentProps) {
  const contentStyle = {
    ...contentBaseStyle,
    ...contentPositionStyle[position],
    ...getDialogContentSizeStyle(position, className),
    ...style,
  };

  return (
    <RadixDialog.Content
      {...props}
      className={cx(
        contentBaseClass,
        contentPositionClass[position],
        className,
      )}
      style={contentStyle}
      onInteractOutside={(event) => {
        onInteractOutside?.(event);
        if (!event.defaultPrevented && isFloatingLayerOutsideEvent(event)) {
          event.preventDefault();
        }
      }}
      onFocusOutside={(event) => {
        onFocusOutside?.(event);
        if (!event.defaultPrevented && isFloatingLayerOutsideEvent(event)) {
          event.preventDefault();
        }
      }}
      onPointerDownOutside={(event) => {
        onPointerDownOutside?.(event);
        if (!event.defaultPrevented && isFloatingLayerOutsideEvent(event)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </RadixDialog.Content>
  );
}

function getDialogContentSizeStyle(
  position: DialogPosition,
  className: string | undefined,
): React.CSSProperties {
  if (position !== "center" || !className) {
    return {};
  }

  const maxWidthClass = Object.keys(maxWidthByClassName).find((candidate) =>
    className.split(/\s+/).includes(candidate),
  );
  const arbitraryMaxWidth = className.match(/(?:^|\s)max-w-\[([^\]]+)\]/);

  return {
    maxWidth:
      arbitraryMaxWidth?.[1] ??
      (maxWidthClass ? maxWidthByClassName[maxWidthClass] : undefined),
  };
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

export function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & DialogFooterProps) {
  return (
    <div {...props} className={cx("mt-4 flex justify-end gap-1.5", className)}>
      {normalizeDialogFooterChildren(children)}
    </div>
  );
}

function normalizeDialogFooterChildren(
  children: React.ReactNode,
): React.ReactNode {
  if (children == null || typeof children === "boolean") {
    return children;
  }

  const normalized = React.Children.toArray(children).map((child) =>
    normalizeDialogFooterNode(child),
  );

  if (normalized.length === 0) {
    return null;
  }

  return normalized.length === 1 ? normalized[0] : normalized;
}

function normalizeDialogFooterNode(child: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(child)) {
    return child;
  }

  const element = child as React.ReactElement<{
    children?: React.ReactNode;
    size?: unknown;
  }>;
  const normalizedChildren = normalizeDialogFooterChildren(
    element.props.children,
  );
  const nextProps: Partial<{
    children: React.ReactNode;
    size: unknown;
  }> = {};

  if (element.type === UiButton) {
    nextProps.size = "sm";
  }

  if (normalizedChildren !== element.props.children) {
    nextProps.children = normalizedChildren;
  }

  if (Object.keys(nextProps).length === 0) {
    return child;
  }

  return React.cloneElement(element, nextProps);
}
