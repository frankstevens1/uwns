import * as React from "react";
import type { TableEmptyStateProps } from "./TableEmptyState.types";
import { cx } from "../../utils/cx";

export function TableEmptyState({
  children,
  align = "center",
  className = "",
  style,
}: TableEmptyStateProps) {
  return (
    <div
      className={cx(
        "px-3 py-6 text-xs italic text-(--ui-muted-fg)",
        align === "center" ? "flex w-full items-center justify-center" : "",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
