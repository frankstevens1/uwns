import * as React from "react";
import type { InlineAlertProps } from "./InlineAlert.types";
import { cx } from "../../utils/cx";

export function InlineAlert({
  tone = "info",
  title,
  message,
  children,
  className = "",
  style,
}: InlineAlertProps) {
  const borderColor =
    tone === "success"
      ? "var(--ui-success-border)"
      : tone === "warning"
        ? "var(--ui-warning-border)"
        : tone === "error"
          ? "var(--ui-danger-border)"
          : "var(--ui-info-border)";

  return (
    <div
      className={cx("rounded-lg border", className)}
      style={{
        borderColor,
        backgroundColor: "var(--ui-subtle-bg)",
        color: "var(--ui-fg)",
        padding: 10,
        ...(style ?? {}),
      }}
    >
      {title ? (
        <div style={{ fontSize: "var(--ui-font-md)", fontWeight: 600 }}>{title}</div>
      ) : null}
      {message ? (
        <div className="mt-1" style={{ fontSize: "var(--ui-font-sm)", color: "var(--ui-muted-fg)" }}>
          {message}
        </div>
      ) : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
