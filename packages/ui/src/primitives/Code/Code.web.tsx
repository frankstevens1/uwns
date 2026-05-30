import * as React from "react";
import type { CodeProps } from "./Code.types";
import { cx } from "../../utils/cx";

type WebProps = CodeProps &
  Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    className?: string;
  };

export function Code({ children, className = "", ...props }: WebProps) {
  return (
    <code
      {...props}
      className={cx(
        "rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-1 py-px font-mono text-[0.92em] text-(--ui-fg)",
        className,
      )}
    >
      {children}
    </code>
  );
}
