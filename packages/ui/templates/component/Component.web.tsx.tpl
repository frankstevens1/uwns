import * as React from "react";
import type { {{ComponentName}}Props } from "./{{ComponentName}}.types";

export function {{ComponentName}}({
  children,
  onPress,
}: {{ComponentName}}Props) {
  return (
    <div
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onClick={onPress}
      onKeyDown={(e) => {
        if (!onPress) return;
        if (e.key === "Enter" || e.key === " ") onPress();
      }}
      className="rounded-lg border border-neutral-200 bg-white p-4 text-neutral-900"
    >
      {children}
    </div>
  );
}
