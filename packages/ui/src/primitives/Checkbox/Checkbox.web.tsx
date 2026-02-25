import type * as React from "react";
import type { CheckboxProps } from "./Checkbox.types";
import { inputTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { useFocusVisible } from "../../utils/focusVisible";
import { px } from "../../utils/platform.web";

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  className = "",
  style,
}: CheckboxProps) {
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const t = inputTokens.base;
  const boxSize = t.fontSize + 4;
  const gap = Math.round(t.fontSize * 0.5);
  const boxRadius = Math.min(t.radius, Math.floor(boxSize / 2));

  const baseStyle: React.CSSProperties = {
    gap: px(gap),
    cursor: disabled ? "not-allowed" : "pointer",
  };

  const inputStyle = {
    width: px(boxSize),
    height: px(boxSize),
    borderRadius: px(boxRadius),
    borderWidth: px(t.borderWidth),
    borderStyle: "solid",
    borderColor: checked ? "var(--ui-primary-bg)" : "var(--ui-border)",
    background: "var(--ui-bg)",
    color: "var(--ui-fg)",
    accentColor: "var(--ui-primary-bg)",
    outline: "none",
    boxShadow: isFocusVisible
      ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
      : "none",
    opacity: disabled ? "var(--ui-disabled-opacity, 0.6)" : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  } as React.CSSProperties;

  const labelStyle: React.CSSProperties = {
    fontSize: px(t.fontSize),
    color: disabled
      ? "var(--ui-disabled-fg, var(--ui-muted-fg))"
      : "var(--ui-fg)",
  };

  return (
    <label
      className={cx("inline-flex items-center select-none", className)}
      style={{ ...baseStyle, ...((style as React.CSSProperties) ?? {}) }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={inputStyle}
      />
      {label ? (
        <span style={labelStyle}>{label}</span>
      ) : null}
    </label>
  );
}
