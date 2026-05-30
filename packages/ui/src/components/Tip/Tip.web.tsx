import * as React from "react";
import { Info } from "lucide-react";
import type { TipProps } from "./Tip.types";
import { cx } from "../../utils/cx";

export function Tip({
  children,
  title,
  icon = true,
  className = "",
  style,
}: TipProps) {
  return (
    <aside
      className={cx(
        "rounded-md border border-(--ui-border) bg-(--ui-subtle-bg) px-3 py-2",
        className,
      )}
      style={style}
    >
      <div className="flex items-start gap-2">
        {icon ? (
          <Info
            aria-hidden="true"
            className="mt-1 shrink-0 text-(--ui-muted-fg)"
            size={14}
            strokeWidth={2}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          {title ? (
            <div className="mb-1 text-xs font-medium leading-5 text-(--ui-fg)">
              {title}
            </div>
          ) : null}
          <div className="text-xs leading-6 text-(--ui-muted-fg)">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
