import * as React from "react";
import type { TextProps } from "./Text.types";
import { cx } from "../../utils/cx";

export function Text({
  children,
  tone = "default",
  variant = "body",
  align = "left",
  numberOfLines,
  className = "",
  style,
}: TextProps) {
  const toneColor =
    tone === "muted"
      ? "var(--ui-muted-fg)"
      : tone === "danger"
        ? "var(--ui-danger-fg)"
        : tone === "success"
          ? "var(--ui-success-fg)"
          : "var(--ui-fg)";

  const variantStyle: React.CSSProperties =
    variant === "title"
      ? { fontSize: "var(--ui-font-lg)", fontWeight: 600 }
      : variant === "label"
        ? { fontSize: "var(--ui-font-sm)", fontWeight: 600 }
        : variant === "hint"
          ? { fontSize: "var(--ui-font-sm)" }
          : variant === "error"
            ? { fontSize: "var(--ui-font-sm)", fontWeight: 500 }
            : { fontSize: "var(--ui-font-md)" };

  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  // Clamp lines on web if requested
  const clampStyle: React.CSSProperties | undefined =
    typeof numberOfLines === "number"
      ? {
          display: "-webkit-box",
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: "vertical" as any,
          overflow: "hidden",
        }
      : undefined;

  return (
    <span
      className={cx(alignClass, className)}
      style={{
        color: toneColor,
        ...variantStyle,
        ...(style as any),
        ...(clampStyle ?? {}),
      }}
    >
      {children}
    </span>
  );
}
