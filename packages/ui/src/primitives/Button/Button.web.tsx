import * as React from "react";
import type { ButtonProps } from "./Button.types";
import { buttonTokens } from "../../theme";
import { useFocusVisible } from "../../utils/focusVisible";
import { mergeWebStyle, px } from "../../utils/platform.web";

type WebProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "children" | "disabled"
> &
  ButtonProps & {
    onClick?: React.MouseEventHandler<HTMLButtonElement>; // back-compat
  };

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  loading,
  onPress,
  onClick,
  title,
  children,
  className = "",
  style,
  type,
  ...props
}: WebProps) {
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const isDisabled = Boolean(disabled || loading);
  const content = children ?? title ?? null;

  const v = buttonTokens.variant[variant];
  const { height, paddingX, fontSize } = buttonTokens.size[size];

  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  const baseBg = isPrimary
    ? "var(--ui-primary-bg)"
    : isGhost
      ? "transparent"
      : "var(--ui-bg)";

  const hoverBg = isPrimary
    ? String(v.hoverBg ?? "var(--ui-primary-bg)")
    : isGhost
      ? "var(--ui-subtle-bg)"
      : String(v.hoverBg ?? "var(--ui-subtle-bg)");

  const activeOpacity = 0.92;

  const borderColor = isPrimary ? "transparent" : "var(--ui-border)";

  // NEW: disabled colors (with fallbacks so you don't have to add vars immediately)
  const disabledBg = "var(--ui-disabled-bg, var(--ui-subtle-bg))";
  const disabledFg = "var(--ui-disabled-fg, var(--ui-muted-fg))";
  const disabledBorder = "var(--ui-border)";

  const resolvedBg = isDisabled ? disabledBg : baseBg;
  const resolvedFg = isDisabled
    ? disabledFg
    : isPrimary
      ? "var(--ui-primary-fg)"
      : "var(--ui-fg)";

  const resolvedBorder = isDisabled
    ? disabledBorder
    : borderColor;

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: px(6),
    userSelect: "none",
    whiteSpace: "nowrap",
    WebkitTapHighlightColor: "transparent",

    height: px(height),
    paddingLeft: px(paddingX),
    paddingRight: px(paddingX),

    borderRadius: px(buttonTokens.base.radius),

    fontSize: px(fontSize),
    fontWeight: buttonTokens.base.fontWeight as any,
    lineHeight: 1,

    borderWidth: buttonTokens.base.borderWidth,
    borderStyle: "solid",
    borderColor: resolvedBorder,

    backgroundColor: resolvedBg,
    color: resolvedFg,

    // IMPORTANT: no opacity dimming — keep text readable
    opacity: 1,
    cursor: isDisabled ? "not-allowed" : "pointer",

    transition:
      "background-color 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
    outline: "none",
    boxShadow: isFocusVisible
      ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
      : "none",
  };

  const finalStyle = mergeWebStyle(baseStyle, style as React.CSSProperties);

  return (
    <button
      {...props}
      type={type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      onClick={onPress ?? onClick}
      className={className}
      style={finalStyle}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        // Always restore to resolved base values
        e.currentTarget.style.backgroundColor = resolvedBg;
        e.currentTarget.style.borderColor = resolvedBorder;
        e.currentTarget.style.color = resolvedFg;
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "";
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.opacity = String(activeOpacity);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {content}
    </button>
  );
}
