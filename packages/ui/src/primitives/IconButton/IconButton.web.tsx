import * as React from "react";
import type { IconButtonProps } from "./IconButton.types";
import { useFocusVisible } from "../../utils/focusVisible";

export function IconButton({ onPress, disabled, children, ...props }: IconButtonProps) {
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      {...props}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--ui-radius-md)",
        border: "none",
        background: "var(--ui-bg)",
        color: "var(--ui-fg)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: isFocusVisible
          ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
          : "none",
      }}
    >
      {children}
    </button>
  );
}
