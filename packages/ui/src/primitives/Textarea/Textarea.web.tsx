import * as React from "react";
import type { TextareaProps } from "./Textarea.types";
import { inputTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { useFocusVisible } from "../../utils/focusVisible";
import { px } from "../../utils/platform.web";

export function Textarea({
  value,
  onChangeText,
  placeholder,
  disabled,
  rows = 4,
  className = "",
  style,
}: TextareaProps) {
  const t = inputTokens.base;
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  return (
    <textarea
      value={value}
      rows={rows}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChangeText(e.target.value)}
      className={cx("placeholder:text-(--ui-muted-fg)", className)}
      style={{
        width: "100%",
        minHeight: px(80),
        borderRadius: px(t.radius),
        borderWidth: px(t.borderWidth),
        borderStyle: "solid",
        borderColor: "var(--ui-border)",
        paddingLeft: px(t.paddingX),
        paddingRight: px(t.paddingX),
        paddingTop: px(8),
        paddingBottom: px(8),
        fontSize: px(t.fontSize),
        background: "var(--ui-bg)",
        color: "var(--ui-fg)",
        outline: "none",
        boxShadow: isFocusVisible
          ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
          : "none",
        opacity: disabled ? 0.7 : 1,
        ...((style as React.CSSProperties) ?? {}),
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
