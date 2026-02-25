import * as React from "react";
import type { InputProps } from "./Input.types";
import { inputTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { useFocusVisible } from "../../utils/focusVisible";
import { px } from "../../utils/platform.web";

function CalendarIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" style={style}>
      <rect
        x="3.25"
        y="4.5"
        width="13.5"
        height="12.25"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.75 2.75v3M13.25 2.75v3M3.25 8h13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function assignInputRef(
  ref: React.ForwardedRef<HTMLInputElement>,
  value: HTMLInputElement | null
) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    ref.current = value;
  }
}

type WebProps = InputProps &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size" | "type"
  > & {
    className?: string;
    style?: React.CSSProperties;
  };

export const Input = React.forwardRef<HTMLInputElement, WebProps>(function Input(
  {
    size = "md",
    error,
    onChangeText,
    type = "text",
    className = "",
    style,
    ...props
  },
  ref
) {
  const t = inputTokens.base;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const isDateType = type === "date";
  const h = size === "sm" ? t.height.sm : t.height.md;
  const baseStyle: React.CSSProperties = {
    height: px(h),
    width: "100%",
    borderRadius: px(t.radius),
    borderWidth: px(t.borderWidth),
    borderStyle: "solid",
    borderColor: error ? "var(--ui-danger-border)" : "var(--ui-border)",
    paddingLeft: px(t.paddingX),
    paddingRight: isDateType ? px(t.paddingX + 26) : px(t.paddingX),
    fontSize: px(t.fontSize),
    background: "var(--ui-bg)",
    color: "var(--ui-fg)",
    outline: "none",
    boxShadow: isFocusVisible
      ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
      : "none",
    appearance: isDateType ? "none" : undefined,
    WebkitAppearance: isDateType ? "none" : undefined,
  };

  const inputElement = (
    <input
      ref={(node) => {
        inputRef.current = node;
        assignInputRef(ref, node);
      }}
      {...props}
      type={type}
      className={cx("placeholder:text-(--ui-muted-fg)", className)}
      style={{ ...baseStyle, ...(style ?? {}) }}
      onChange={(e) => onChangeText?.(e.target.value)}
      placeholder={props.placeholder}
      onFocus={(e) => {
        onFocus();
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        onBlur();
        props.onBlur?.(e);
      }}
    />
  );

  if (!isDateType) {
    return inputElement;
  }

  return (
    <div className="relative w-full">
      {inputElement}
      <button
        type="button"
        disabled={props.disabled}
        aria-label="Open calendar"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const el = inputRef.current as
            | (HTMLInputElement & { showPicker?: () => void })
            | null;
          if (!el) return;
          if (typeof el.showPicker === "function") {
            el.showPicker();
            return;
          }
          el.focus();
        }}
        className="absolute border-0 bg-transparent p-0"
        style={{
          top: "50%",
          right: px(t.paddingX),
          transform: "translateY(-50%)",
          width: px(18),
          height: px(18),
          color: "var(--ui-muted-fg)",
          cursor: props.disabled ? "not-allowed" : "pointer",
          opacity: props.disabled ? 0.6 : 1,
        }}
      >
        <CalendarIcon style={{ width: px(18), height: px(18) }} />
      </button>
    </div>
  );
});
