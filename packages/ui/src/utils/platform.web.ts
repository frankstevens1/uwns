import type * as React from "react";

export const isWeb = true;

export function px(n: number): string {
  return `${n}px`;
}

export function mergeWebStyle(
  a?: React.CSSProperties,
  b?: React.CSSProperties
): React.CSSProperties | undefined {
  if (!a && !b) return undefined;
  return { ...(a ?? {}), ...(b ?? {}) };
}
