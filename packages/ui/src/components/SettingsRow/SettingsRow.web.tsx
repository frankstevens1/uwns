import * as React from "react";
import { cx } from "../../utils/cx";
import type { SettingsRowProps } from "./SettingsRow.types";

export function SettingsRow({
  label,
  description,
  summary,
  actions,
  className = "",
  style,
}: SettingsRowProps) {
  return (
    <div
      className={cx(
        "rounded-lg border border-(--ui-border) bg-(--ui-subtle-bg) px-3 py-2",
        "grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
        className,
      )}
      style={style}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-(--ui-fg)">{label}</div>
        {description ? (
          <div className="mt-0.5 text-xs text-(--ui-muted-fg)">
            {description}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {summary ? <div className="min-w-0">{summary}</div> : null}
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
