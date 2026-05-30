"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import type { ReadOnlyInputProps } from "./ReadOnlyInput.types";
import { inputTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { px } from "../../utils/platform.web";

type WebProps = ReadOnlyInputProps & {
  className?: string;
  style?: React.CSSProperties;
};

export function ReadOnlyInput({
  label,
  value,
  loading = false,
  placeholder = "-",
  copyable = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  size = "md",
  className = "",
  style,
}: WebProps) {
  const id = React.useId();
  const [copied, setCopied] = React.useState(false);
  const displayValue = value ?? (loading ? "Loading..." : placeholder);
  const canCopy = copyable && Boolean(value);
  const t = inputTokens.base;
  const height = size === "sm" ? t.height.sm : t.height.md;
  const copyHeight = Math.max(24, height - 6);

  const onCopy = async () => {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(true);
    globalThis.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={cx("space-y-1", className)} style={style}>
      <label htmlFor={id} className="block text-sm text-(--ui-muted-fg)">
        {label}
      </label>
      <div
        className="flex items-center border border-(--ui-border) bg-(--ui-subtle-bg)"
        style={{
          height: px(height),
          borderRadius: px(t.radius),
          borderWidth: px(t.borderWidth),
        }}
      >
        <input
          id={id}
          readOnly
          value={displayValue}
          className="min-w-0 flex-1 truncate bg-transparent font-mono text-(--ui-fg) outline-none"
          style={{
            paddingLeft: px(t.paddingX),
            paddingRight: px(t.paddingX),
            fontSize: px(t.fontSize),
          }}
          aria-label={label}
        />
        {copyable ? (
          <button
            type="button"
            onClick={onCopy}
            disabled={!canCopy}
            className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-semibold text-(--ui-muted-fg) hover:text-(--ui-fg) disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              height: px(copyHeight),
              paddingLeft: px(size === "sm" ? 6 : 8),
              paddingRight: px(size === "sm" ? 6 : 8),
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
