import * as React from "react";
import type { StackProps } from "./Stack.types";
import { cx } from "../../utils/cx";

export function Stack({
  children,
  direction = "vertical",
  gap = 8,
  align = "stretch",
  justify = "start",
  wrap = false,
  className = "",
  style,
}: StackProps) {
  return (
    <div
      className={cx(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        align === "start"
          ? "items-start"
          : align === "center"
            ? "items-center"
            : align === "end"
              ? "items-end"
              : "items-stretch",
        justify === "start"
          ? "justify-start"
          : justify === "center"
            ? "justify-center"
            : justify === "end"
              ? "justify-end"
              : "justify-between",
        wrap ? "flex-wrap" : "flex-nowrap",
        className
      )}
      style={{ gap, ...(style as any) }}
    >
      {children}
    </div>
  );
}
